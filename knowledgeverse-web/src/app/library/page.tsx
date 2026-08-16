'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { BOOK_COVERS, BOOK_ACCENT } from '@/lib/utils';

const STATIC_BOOKS: Record<string, {
    name: string; author: string; category: string; pages: number;
    language: string; description: string; chunks: number; status: string;
}> = {
    quran: { name: 'Quran', author: 'Revelation / Prophet Muhammad (PBUH)', category: 'Scripture', pages: 604, language: 'Arabic/English', description: 'The holy book of Islam, revealed to Prophet Muhammad (PBUH). Contains 114 Surahs covering theology, law, and ethics.', chunks: 6236, status: 'indexed' },
    bible: { name: 'Bible', author: 'Multiple Authors', category: 'Scripture', pages: 1200, language: 'English', description: 'The Christian sacred text, consisting of the Old and New Testaments. A foundational text of Western civilization.', chunks: 31102, status: 'indexed' },
    torah: { name: 'Torah', author: 'Moses (attributed)', category: 'Scripture', pages: 400, language: 'Hebrew/English', description: 'The foundational text of Judaism, comprising the Five Books of Moses (Pentateuch).', chunks: 5845, status: 'indexed' },
    bhagavad_gita: { name: 'Bhagavad Gita', author: 'Vyasa', category: 'Scripture', pages: 320, language: 'Sanskrit/English', description: 'The philosophical dialogue between Arjuna and Lord Krishna. A key text in Hindu philosophy on duty, devotion, and liberation.', chunks: 701, status: 'indexed' },
    dhammapada: { name: 'Dhammapada', author: 'Gautama Buddha', category: 'Scripture', pages: 120, language: 'Pali/English', description: 'A collection of 423 verses attributed to the Buddha. One of the most beloved books in the Theravada Buddhist canon.', chunks: 423, status: 'indexed' },
    hadith: { name: 'Hadith Collections', author: 'Al-Bukhari & Muslim', category: 'Scripture', pages: 800, language: 'Arabic/English', description: 'Collections of sayings and actions of Prophet Muhammad (PBUH), supplementing the Quran.', chunks: 7563, status: 'indexed' },
    us_constitution: { name: 'U.S. Constitution', author: 'Founding Fathers', category: 'Legal', pages: 50, language: 'English', description: 'The supreme law of the United States, establishing the framework of the federal government and defining individual rights.', chunks: 267, status: 'indexed' },
};

const CATEGORY_COLORS: Record<string, string> = {
    Scripture: '#8b5cf6',
    Legal: '#3b82f6',
    'Academic': '#10b981',
    'Uploaded PDF': '#6366f1',
};

interface UploadStatus {
    status: string;
    progress: number;
    stage?: string;
    filename?: string;
}

export default function LibraryPage() {
    const router = useRouter();
    const { selectedBooks, toggleBook, setAvailableBooks } = useAppStore();
    const [books, setBooks] = useState(STATIC_BOOKS);
    const [uploadId, setUploadId] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
    const [dragging, setDragging] = useState(false);
    const [filter, setFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setAvailableBooks(books);
    }, [books, setAvailableBooks]);

    const categories = ['All', ...Array.from(new Set(Object.values(books).map((b) => b.category)))];

    const filteredBooks = Object.entries(books).filter(([, b]) => {
        const matchCat = filter === 'All' || b.category === filter;
        const matchSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    const pollUploadStatus = useCallback(async (id: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/upload/${id}/status`);
                const data = await res.json();
                setUploadStatus(data);
                if (data.status === 'complete') {
                    clearInterval(interval);
                    setTimeout(() => setUploadStatus(null), 3000);
                    const bookRes = await fetch('http://localhost:8000/api/books');
                    const bookData = await bookRes.json();
                    setBooks({ ...STATIC_BOOKS, ...bookData.books });
                    setAvailableBooks({ ...STATIC_BOOKS, ...bookData.books });
                }
            } catch { clearInterval(interval); }
        }, 1000);
    }, [setAvailableBooks]);

    const handleFileUpload = useCallback(async (file: File) => {
        if (!file.name.endsWith('.pdf')) { alert('Only PDF files are supported.'); return; }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('http://localhost:8000/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            setUploadId(data.upload_id);
            setUploadStatus({ status: 'processing', progress: 0 });
            pollUploadStatus(data.upload_id);
        } catch {
            alert('Backend not connected. PDF upload requires the FastAPI server to be running.');
        }
    }, [pollUploadStatus]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    }, [handleFileUpload]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#070711', fontFamily: 'Inter, sans-serif' }}>
            {/* Nav */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(7,7,17,0.9)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(99,102,241,0.15)',
            }}>
                <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔮</div>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>KnowledgeVerse <span style={{ color: '#818cf8' }}>AI</span></span>
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                    {selectedBooks.length > 0 && (
                        <button
                            onClick={() => router.push('/workspace')}
                            style={{
                                padding: '9px 22px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', border: 'none', cursor: 'pointer', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                        >
                            🚀 Research with {selectedBooks.length} book{selectedBooks.length > 1 ? 's' : ''}
                        </button>
                    )}
                </div>
            </nav>

            <div style={{ padding: '100px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 10 }}>LIBRARY</div>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 12 }}>
                        Book Library
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 600, lineHeight: 1.6 }}>
                        Select one or more books to include in your research. Only selected books will be searched.
                    </p>
                </div>

                {/* Selection banner */}
                {selectedBooks.length > 0 && (
                    <div style={{
                        padding: '14px 20px', marginBottom: 28,
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, background: '#6366f1', borderRadius: '50%', animation: 'pulse-ring 2s infinite' }} />
                            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>
                                {selectedBooks.length} book{selectedBooks.length > 1 ? 's' : ''} selected for research
                            </span>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {selectedBooks.map((k) => (
                                    <span key={k} style={{ padding: '2px 8px', background: 'rgba(99,102,241,0.2)', borderRadius: 6, fontSize: '0.75rem', color: '#818cf8' }}>
                                        {BOOK_COVERS[k] || '📄'} {books[k]?.name || k}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/workspace')}
                            style={{
                                padding: '8px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', border: 'none', cursor: 'pointer', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem',
                                whiteSpace: 'nowrap',
                            }}
                        >🚀 Start Research</button>
                    </div>
                )}

                {/* Controls */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search books..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-glass"
                        style={{ padding: '10px 16px', fontSize: '0.9rem', flex: '1 1 200px', minWidth: 200 }}
                    />
                    {/* Categories */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setFilter(c)}
                                style={{
                                    padding: '8px 16px', borderRadius: 8, fontWeight: 500, fontSize: '0.85rem',
                                    cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                                    background: filter === c ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                                    color: filter === c ? '#818cf8' : '#64748b',
                                    outline: filter === c ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                }}
                            >{c}</button>
                        ))}
                    </div>
                    {/* Select All / Clear */}
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                        <button
                            onClick={() => filteredBooks.forEach(([k]) => { if (!selectedBooks.includes(k)) toggleBook(k); })}
                            style={{ padding: '8px 14px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500 }}
                        >Select All</button>
                        <button
                            onClick={() => selectedBooks.forEach((k) => toggleBook(k))}
                            style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500 }}
                        >Clear</button>
                    </div>
                </div>

                {/* Book Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {filteredBooks.map(([key, book]) => {
                        const selected = selectedBooks.includes(key);
                        const accent = BOOK_ACCENT[key] || '#6366f1';
                        return (
                            <div
                                key={key}
                                onClick={() => toggleBook(key)}
                                className="glass-card"
                                style={{
                                    padding: 0, cursor: 'pointer', overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    border: selected ? `2px solid ${accent}60` : '1px solid rgba(99,102,241,0.15)',
                                    boxShadow: selected ? `0 8px 30px ${accent}20` : 'none',
                                    transform: selected ? 'translateY(-2px)' : 'none',
                                }}
                                onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${accent}15`; }}
                                onMouseLeave={(e) => { if (!selected) { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; } }}
                            >
                                {/* Cover */}
                                <div style={{
                                    height: 120,
                                    background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0 24px',
                                    borderBottom: `1px solid ${accent}20`,
                                    position: 'relative',
                                }}>
                                    <div style={{ fontSize: 48 }}>{BOOK_COVERS[key] || '📄'}</div>
                                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: '50%',
                                            background: selected ? accent : 'rgba(255,255,255,0.06)',
                                            border: `2px solid ${selected ? accent : 'rgba(255,255,255,0.12)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s',
                                        }}>
                                            {selected && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: accent, fontWeight: 600, background: `${accent}20`, padding: '3px 10px', borderRadius: 100, marginBottom: 4 }}>{book.category}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#475569' }}>{book.pages} pages</div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <h3 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1rem' }}>{book.name}</h3>
                                        <span style={{ fontSize: '0.7rem', color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 6 }}>{book.language}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 10 }}>by {book.author}</div>
                                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55, marginBottom: 14 }}>{book.description}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                                            <span style={{ fontSize: '0.72rem', color: '#475569' }}>Indexed</span>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                                            <span style={{ color: accent, fontWeight: 600 }}>{book.chunks.toLocaleString()}</span> chunks
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Upload Section */}
                <div style={{ marginTop: 60 }}>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.3rem', marginBottom: 4 }}>📤 Upload Your Own PDF</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upload any PDF document to index and research alongside existing books.</p>
                    </div>

                    {/* Upload Progress */}
                    {uploadStatus && (
                        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{uploadStatus.stage || 'Processing...'}</span>
                                <span style={{ color: '#818cf8', fontWeight: 600 }}>{uploadStatus.progress}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${uploadStatus.progress}%` }} />
                            </div>
                            {uploadStatus.status === 'complete' && (
                                <div style={{ color: '#34d399', marginTop: 8, fontSize: '0.85rem', fontWeight: 500 }}>✓ Document indexed successfully!</div>
                            )}
                        </div>
                    )}

                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input')?.click()}
                        className="glass-card"
                        style={{
                            padding: '60px 40px', textAlign: 'center', cursor: 'pointer',
                            border: dragging ? '2px dashed rgba(99,102,241,0.6)' : '2px dashed rgba(99,102,241,0.2)',
                            background: dragging ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.03)',
                            transition: 'all 0.3s',
                        }}
                    >
                        <input id="file-input" type="file" accept=".pdf" onChange={handleFileInput} style={{ display: 'none' }} />
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
                        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '1.05rem', marginBottom: 8 }}>
                            Drop PDF here or click to browse
                        </div>
                        <div style={{ color: '#475569', fontSize: '0.85rem' }}>
                            Supports PDF documents up to 100MB
                        </div>
                        <div style={{ marginTop: 20, display: 'inline-flex', padding: '8px 20px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, color: '#818cf8', fontSize: '0.85rem', fontWeight: 500 }}>
                            Choose File
                        </div>
                    </div>

                    {/* Pipeline Steps */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                        {['Upload', 'Extract Text', 'Clean', 'Chunk', 'Embed', 'Store in ChromaDB'].map((step, i) => (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ padding: '4px 12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 100, fontSize: '0.75rem', color: '#818cf8', fontWeight: 500 }}>{step}</div>
                                {i < 5 && <span style={{ color: '#334155', fontSize: '0.9rem' }}>→</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
