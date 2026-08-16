export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const BOOK_COVERS: Record<string, string> = {
    quran: '📖',
    bible: '✝️',
    torah: '✡️',
    bhagavad_gita: '🕉️',
    dhammapada: '☸️',
    hadith: '☪️',
    us_constitution: '🏛️',
};

export const BOOK_COLORS: Record<string, string> = {
    quran: 'from-emerald-600 to-teal-700',
    bible: 'from-blue-600 to-indigo-700',
    torah: 'from-yellow-600 to-amber-700',
    bhagavad_gita: 'from-orange-600 to-red-700',
    dhammapada: 'from-purple-600 to-violet-700',
    hadith: 'from-green-700 to-emerald-800',
    us_constitution: 'from-slate-600 to-gray-700',
};

export const BOOK_ACCENT: Record<string, string> = {
    quran: '#10b981',
    bible: '#3b82f6',
    torah: '#f59e0b',
    bhagavad_gita: '#f97316',
    dhammapada: '#8b5cf6',
    hadith: '#22c55e',
    us_constitution: '#6b7280',
};

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function formatConfidence(score: number): string {
    return `${Math.round(score * 100)}%`;
}

export function getSimilarityLabel(score: number): string {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'High';
    if (score >= 0.7) return 'Good';
    if (score >= 0.6) return 'Moderate';
    return 'Low';
}

export function getOverlapColor(score: number): string {
    if (score >= 0.7) return '#34d399';
    if (score >= 0.4) return '#fbbf24';
    return '#f87171';
}

export function getOverlapLabel(score: number): { label: string; icon: string; color: string } {
    if (score >= 0.7) return { label: 'High Thematic Overlap', icon: '🟢', color: '#34d399' };
    if (score >= 0.4) return { label: 'Moderate Thematic Overlap', icon: '🟡', color: '#fbbf24' };
    if (score > 0) return { label: 'Low Thematic Overlap', icon: '🔴', color: '#f87171' };
    return { label: 'No Relevant Evidence', icon: '⚪', color: '#94a3b8' };
}

export async function fetchResearch(question: string, books: string[], mode = 'normal') {
    const res = await fetch(`${API_BASE}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, selected_books: books, mode }),
    });
    if (!res.ok) throw new Error('Research request failed');
    return res.json();
}

export async function fetchComparison(question: string, books: string[]) {
    const res = await fetch(`${API_BASE}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, selected_books: books }),
    });
    if (!res.ok) throw new Error('Comparison request failed');
    return res.json();
}

export async function fetchKnowledgeGraph(topic: string, books: string[]) {
    const res = await fetch(`${API_BASE}/api/graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, selected_books: books }),
    });
    if (!res.ok) throw new Error('Graph request failed');
    return res.json();
}

export async function fetchBooks() {
    const res = await fetch(`${API_BASE}/api/books`);
    if (!res.ok) throw new Error('Failed to fetch books');
    return res.json();
}

export async function fetchStats() {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}
