"""
KnowledgeVerse AI - Real RAG Backend
Uses FastAPI, LangChain, ChromaDB, SentenceTransformers, and Groq API.
"""
import os
import json
import uuid
import asyncio
from typing import List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# RAG Imports
import chromadb
import pypdf
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

# ─── App Config ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="KnowledgeVerse AI API (Real RAG)",
    description="Multi-Book RAG Research Platform",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── RAG Initialization ──────────────────────────────────────────────────────
DB_DIR = "./chroma_db"
os.makedirs(DB_DIR, exist_ok=True)

print("Initializing Embeddings Model...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

print("Initializing ChromaDB...")
chroma_client = chromadb.PersistentClient(path=DB_DIR)

# Get Groq API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in environment. LLM features will fail.")

# ─── State ───────────────────────────────────────────────────────────────────
UPLOAD_STATUS: Dict[str, Dict] = {}
# We store metadata about indexed books in a special Chroma collection or in-memory for now
try:
    meta_collection = chroma_client.get_or_create_collection(name="knowledgeverse_metadata")
except Exception as e:
    print(f"Error creating metadata collection: {e}")

def get_indexed_books() -> Dict[str, Dict]:
    try:
        meta_collection = chroma_client.get_collection(name="knowledgeverse_metadata")
        results = meta_collection.get()
        books = {}
        for i, meta in enumerate(results['metadatas']):
            book_key = results['ids'][i]
            books[book_key] = meta
        return books
    except Exception:
        return {}

def save_book_metadata(book_key: str, metadata: Dict):
    meta_collection = chroma_client.get_or_create_collection(name="knowledgeverse_metadata")
    meta_collection.upsert(
        ids=[book_key],
        metadatas=[metadata],
        documents=[metadata.get("name", book_key)]
    )

# ─── Pydantic Models ──────────────────────────────────────────────────────────
class ResearchRequest(BaseModel):
    question: str
    selected_books: List[str]
    mode: str = "normal"

class CompareRequest(BaseModel):
    question: str
    selected_books: List[str]

class GraphRequest(BaseModel):
    topic: str
    selected_books: List[str]

# ─── Helper Functions ─────────────────────────────────────────────────────────
async def process_pdf_background(upload_id: str, file_path: str, filename: str):
    try:
        # 1. Extract Text
        UPLOAD_STATUS[upload_id] = {"status": "processing", "progress": 20, "stage": "Extracting text...", "filename": filename}
        reader = pypdf.PdfReader(file_path)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n\n"
        
        # 2. Chunking
        UPLOAD_STATUS[upload_id] = {"status": "processing", "progress": 40, "stage": "Chunking text...", "filename": filename}
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        chunks = text_splitter.split_text(text)
        
        # 3. Generating Embeddings & Storing
        UPLOAD_STATUS[upload_id] = {"status": "processing", "progress": 60, "stage": "Generating embeddings & storing...", "filename": filename}
        
        book_key = filename.replace(".pdf", "").lower().replace(" ", "_")[:20]
        collection = chroma_client.get_or_create_collection(name=book_key)
        
        # Batch processing for ChromaDB
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i+batch_size]
            batch_ids = [f"{book_key}_chunk_{j}" for j in range(i, i+len(batch_chunks))]
            batch_metadatas = [{"source": filename, "chunk_index": j} for j in range(i, i+len(batch_chunks))]
            
            # Generate embeddings using the sentence transformer model
            batch_embeddings = embeddings.embed_documents(batch_chunks)
            
            collection.add(
                ids=batch_ids,
                documents=batch_chunks,
                embeddings=batch_embeddings,
                metadatas=batch_metadatas
            )
            progress = 60 + int((i / len(chunks)) * 35)
            UPLOAD_STATUS[upload_id]["progress"] = progress
            
        # 4. Save Metadata
        metadata = {
            "name": filename.replace(".pdf", ""),
            "author": "Uploaded Document",
            "category": "Uploaded PDF",
            "pages": len(text) // 3000,
            "language": "English",
            "description": f"User-uploaded document: {filename}",
            "chunks": len(chunks),
            "status": "indexed",
        }
        save_book_metadata(book_key, metadata)
        
        UPLOAD_STATUS[upload_id] = {"status": "complete", "progress": 100, "stage": "Complete!", "filename": filename}
        os.remove(file_path) # Clean up temp file
    except Exception as e:
        UPLOAD_STATUS[upload_id] = {"status": "error", "progress": 0, "stage": f"Error: {str(e)}", "filename": filename}
        print(f"Error processing PDF: {e}")

def retrieve_context(question: str, book_key: str, k: int = 3) -> List[Dict]:
    try:
        collection = chroma_client.get_collection(name=book_key)
        query_embedding = embeddings.embed_query(question)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=k,
            include=["documents", "metadatas", "distances"]
        )
        
        contexts = []
        if results['documents'] and len(results['documents']) > 0:
            for i in range(len(results['documents'][0])):
                # Convert distance to similarity score (approximate)
                distance = results['distances'][0][i]
                similarity = max(0.0, 1.0 - (distance / 2.0)) 
                
                contexts.append({
                    "text": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "similarity": similarity
                })
        return contexts
    except Exception as e:
        print(f"Error retrieving from {book_key}: {e}")
        return []

# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "KnowledgeVerse AI API (Real RAG) v1.1.0", "status": "operational"}

@app.get("/api/books")
async def get_books():
    books = get_indexed_books()
    return {"books": books}

@app.post("/api/upload")
async def upload_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    upload_id = str(uuid.uuid4())
    UPLOAD_STATUS[upload_id] = {"status": "processing", "progress": 0, "stage": "Saving file...", "filename": file.filename}
    
    # Save file temporarily
    temp_path = f"./temp_{upload_id}.pdf"
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    background_tasks.add_task(process_pdf_background, upload_id, temp_path, file.filename)
    return {"upload_id": upload_id, "filename": file.filename, "status": "processing"}

@app.get("/api/upload/{upload_id}/status")
async def get_upload_status(upload_id: str):
    if upload_id not in UPLOAD_STATUS:
        raise HTTPException(status_code=404, detail="Upload not found")
    return UPLOAD_STATUS[upload_id]

@app.post("/api/research")
async def research(request: ResearchRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set in the environment.")
    if not request.selected_books:
        raise HTTPException(status_code=400, detail="Please select at least one book.")
        
    llm = ChatGroq(temperature=0.2, model_name="llama-3.1-70b-versatile", groq_api_key=GROQ_API_KEY)
    
    results = []
    indexed_books = get_indexed_books()
    
    for book_key in request.selected_books:
        contexts = retrieve_context(request.question, book_key, k=2)
        if not contexts:
            continue
            
        best_context = contexts[0]
        context_text = "\n\n".join([c["text"] for c in contexts])
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert academic researcher. Answer the user's question based ONLY on the provided context from the book '{book_name}'. Maintain a neutral, objective tone. Do not hallucinate. If the context does not contain the answer, state that clearly. Format your response as a JSON object with the following keys: 'summary' (1-2 sentences), 'explanation' (detailed explanation), 'main_idea' (short phrase), 'unique_perspective' (what makes this source unique)."),
            ("human", "Context:\n{context}\n\nQuestion: {question}")
        ])
        
        chain = prompt | llm | StrOutputParser()
        
        try:
            response_text = chain.invoke({
                "book_name": indexed_books.get(book_key, {}).get("name", book_key),
                "context": context_text,
                "question": request.question
            })
            
            # Attempt to parse JSON from LLM response
            try:
                # Clean up potential markdown formatting
                clean_json = response_text.replace("```json", "").replace("```", "").strip()
                parsed_response = json.loads(clean_json)
            except json.JSONDecodeError:
                parsed_response = {
                    "summary": response_text[:200] + "...",
                    "explanation": response_text,
                    "main_idea": "Extracted from text",
                    "unique_perspective": "See explanation"
                }
                
            results.append({
                "book_key": book_key,
                "book_name": indexed_books.get(book_key, {}).get("name", book_key),
                "summary": parsed_response.get("summary", ""),
                "explanation": parsed_response.get("explanation", ""),
                "citation": {
                    "chapter": f"Chunk {best_context['metadata'].get('chunk_index', 'Unknown')}",
                    "verse": "Retrieved Passage",
                    "text": best_context["text"],
                    "confidence": 0.95, # Mocked confidence for now
                    "similarity": best_context["similarity"]
                },
                "main_idea": parsed_response.get("main_idea", ""),
                "unique_perspective": parsed_response.get("unique_perspective", "")
            })
        except Exception as e:
            print(f"Error generating response for {book_key}: {e}")
            
    # Generate Insights (Mocked for speed, but could also use LLM)
    overlap_score = 0.85 if len(results) > 1 else 1.0
    insights = {
        "executive_summary": f"Analysis of '{request.question}' across {len(results)} sources completed.",
        "common_themes": ["Theme 1", "Theme 2"],
        "unique_perspectives": [f"{r['book_name']} perspective" for r in results],
        "historical_context": "Generated based on retrieved documents.",
        "modern_relevance": "Highly relevant to contemporary discussions.",
        "follow_up_questions": [f"What else does the text say about {request.question.split()[0]}?"],
    }
    
    return {
        "question": request.question,
        "results": results,
        "thematic_overlap_score": overlap_score,
        "overlap_category": "High Thematic Overlap" if overlap_score > 0.7 else "Moderate Thematic Overlap",
        "insights": insights,
        "source_coverage": {
            "selected": len(request.selected_books),
            "with_evidence": len(results),
            "without_evidence": len(request.selected_books) - len(results),
        },
    }

@app.get("/api/stats")
async def get_stats():
    books = get_indexed_books()
    return {
        "books_indexed": len(books),
        "total_chunks": sum(b.get("chunks", 0) for b in books.values()),
        "questions_asked": 0,
        "saved_reports": 0,
        "bookmarks": 0,
        "research_sessions": 0,
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
