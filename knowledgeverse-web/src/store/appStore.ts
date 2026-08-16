'use client';

import { create } from 'zustand';

export interface BookInfo {
    name: string;
    author: string;
    category: string;
    pages: number;
    language: string;
    description: string;
    chunks: number;
    status: string;
}

export interface Citation {
    chapter: string;
    verse: string;
    text: string;
    confidence: number;
    similarity: number;
}

export interface BookResult {
    book_key: string;
    book_name: string;
    summary: string;
    explanation: string;
    citation: Citation;
    main_idea: string;
    unique_perspective: string;
}

export interface ResearchResult {
    question: string;
    results: BookResult[];
    thematic_overlap_score: number;
    overlap_category: string;
    insights: {
        executive_summary: string;
        common_themes: string[];
        unique_perspectives: string[];
        historical_context: string;
        modern_relevance: string;
        follow_up_questions: string[];
    };
    source_coverage: {
        selected: number;
        with_evidence: number;
        without_evidence: number;
    };
}

export interface Bookmark {
    id: string;
    title: string;
    content: ResearchResult;
    createdAt: Date;
    note?: string;
}

interface AppState {
    // Books
    selectedBooks: string[];
    availableBooks: Record<string, BookInfo>;
    toggleBook: (key: string) => void;
    setAvailableBooks: (books: Record<string, BookInfo>) => void;

    // Theme
    isDark: boolean;
    toggleTheme: () => void;

    // Research
    researchHistory: ResearchResult[];
    currentResult: ResearchResult | null;
    isLoading: boolean;
    setCurrentResult: (r: ResearchResult | null) => void;
    addToHistory: (r: ResearchResult) => void;
    setLoading: (v: boolean) => void;

    // Bookmarks
    bookmarks: Bookmark[];
    addBookmark: (result: ResearchResult, note?: string) => void;
    removeBookmark: (id: string) => void;

    // Sidebar
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;

    // Active tab
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    selectedBooks: ['quran', 'bible'],
    availableBooks: {},
    toggleBook: (key) =>
        set((s) => ({
            selectedBooks: s.selectedBooks.includes(key)
                ? s.selectedBooks.filter((b) => b !== key)
                : [...s.selectedBooks, key],
        })),
    setAvailableBooks: (books) => set({ availableBooks: books }),

    isDark: true,
    toggleTheme: () => set((s) => ({ isDark: !s.isDark })),

    researchHistory: [],
    currentResult: null,
    isLoading: false,
    setCurrentResult: (r) => set({ currentResult: r }),
    addToHistory: (r) =>
        set((s) => ({ researchHistory: [r, ...s.researchHistory].slice(0, 20) })),
    setLoading: (v) => set({ isLoading: v }),

    bookmarks: [],
    addBookmark: (result, note) =>
        set((s) => ({
            bookmarks: [
                {
                    id: Date.now().toString(),
                    title: result.question,
                    content: result,
                    createdAt: new Date(),
                    note,
                },
                ...s.bookmarks,
            ],
        })),
    removeBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),

    sidebarOpen: true,
    setSidebarOpen: (v) => set({ sidebarOpen: v }),

    activeTab: 'results',
    setActiveTab: (tab) => set({ activeTab: tab }),
}));
