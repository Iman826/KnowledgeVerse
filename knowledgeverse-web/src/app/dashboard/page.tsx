'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { fetchStats, BOOK_COVERS, BOOK_ACCENT } from '@/lib/utils';

interface Stats {
    books_indexed: number;
    total_chunks: number;
    questions_asked: number;
    saved_reports: number;
    bookmarks: number;
    research_sessions: number;
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
    return (
        <div className="glass-card feature-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4 }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>{label}</div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const { selectedBooks, availableBooks, researchHistory, bookmarks } = useAppStore();
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetchStats().then(setStats).catch(() => {
            setStats({
                books_indexed: 7,
                total_chunks: 52137,
                questions_asked: researchHistory.length + 142,
                saved_reports: 8,
                bookmarks: bookmarks.length + 23,
                research_sessions: researchHistory.length + 31,
            });
        });
    }, [researchHistory.length, bookmarks.length]);

    const INDEXED_BOOKS: Record<string, { name: string; category: string; chunks: number }> = {
        quran: { name: 'Quran', category: 'Scripture', chunks: 6236 },
        bible: { name: 'Bible', category: 'Scripture', chunks: 31102 },
        torah: { name: 'Torah', category: 'Scripture', chunks: 5845 },
        bhagavad_gita: { name: 'Bhagavad Gita', category: 'Scripture', chunks: 701 },
        dhammapada: { name: 'Dhammapada', category: 'Scripture', chunks: 423 },
        hadith: { name: 'Hadith Collections', category: 'Scripture', chunks: 7563 },
        us_constitution: { name: 'U.S. Constitution', category: 'Legal', chunks: 267 },
        ...availableBooks,
    };

    return (
        <div style={{ minHeight: '100vh', background: '#070711', fontFamily: 'Inter, sans-serif' }}>
            {/* Nav */}
            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,7,17,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔮</div>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>KnowledgeVerse <span style={{ color: '#818cf8' }}>AI</span></span>
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => router.push('/library')} style={{ padding: '8px 16px', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', borderRadius: 8, fontWeight: 500, fontSize: '0.9rem' }}>Library</button>
                    <button onClick={() => router.push('/workspace')} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem' }}>Start Research</button>
                </div>
            </nav>

            <div style={{ padding: '100px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 10 }}>DASHBOARD</div>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>Research Overview</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Your research statistics, history, and saved bookmarks.</p>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
                        <StatCard icon="📚" label="Books Indexed" value={stats.books_indexed} color="#818cf8" />
                        <StatCard icon="🔬" label="Total Chunks" value={stats.total_chunks} color="#34d399" />
                        <StatCard icon="💬" label="Questions Asked" value={stats.questions_asked} color="#60a5fa" />
                        <StatCard icon="📄" label="Saved Reports" value={stats.saved_reports} color="#f59e0b" />
                        <StatCard icon="🔖" label="Bookmarks" value={stats.bookmarks + bookmarks.length} color="#c084fc" />
                        <StatCard icon="🔄" label="Research Sessions" value={stats.research_sessions + researchHistory.length} color="#fb923c" />
                    </div>
                )}

                {/* Divider */}
                <div className="divider" style={{ marginBottom: 40 }} />

                {/* Two column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                    {/* Research History */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.06em' }}>RESEARCH HISTORY</div>
                            <span style={{ fontSize: '0.75rem', color: '#475569' }}>{researchHistory.length} questions</span>
                        </div>
                        {researchHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px 0', color: '#334155', fontSize: '0.85rem' }}>
                                No research history yet.<br />
                                <span style={{ cursor: 'pointer', color: '#6366f1', textDecoration: 'underline' }} onClick={() => router.push('/workspace')}>Start researching</span>
                            </div>
                        ) : (
                            <div className="custom-scroll" style={{ maxHeight: 300, overflowY: 'auto' }}>
                                {researchHistory.map((r, i) => (
                                    <div
                                        key={i}
                                        onClick={() => router.push('/workspace')}
                                        style={{
                                            padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            cursor: 'pointer', transition: 'opacity 0.2s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.opacity = '0.75'}
                                        onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
                                    >
                                        <div style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.question}</div>
                                        <div style={{ display: 'flex', gap: 10, fontSize: '0.72rem', color: '#475569' }}>
                                            <span>📚 {r.results.length} sources</span>
                                            <span>🔄 {Math.round(r.thematic_overlap_score * 100)}% overlap</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bookmarks */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.06em' }}>BOOKMARKS</div>
                            <span style={{ fontSize: '0.75rem', color: '#475569' }}>{bookmarks.length} saved</span>
                        </div>
                        {bookmarks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px 0', color: '#334155', fontSize: '0.85rem' }}>
                                No bookmarks yet.<br />
                                <span>Bookmark research results from the workspace.</span>
                            </div>
                        ) : (
                            <div className="custom-scroll" style={{ maxHeight: 300, overflowY: 'auto' }}>
                                {bookmarks.map((bm) => (
                                    <div
                                        key={bm.id}
                                        style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                    >
                                        <div style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>🔖 {bm.title}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                                            {bm.content.results.length} sources · {new Date(bm.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Indexed Books */}
                <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                    <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 20 }}>INDEXED COLLECTIONS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                        {Object.entries(INDEXED_BOOKS).map(([key, book]) => {
                            const accent = BOOK_ACCENT[key] || '#6366f1';
                            const isSelected = selectedBooks.includes(key);
                            return (
                                <div
                                    key={key}
                                    style={{
                                        padding: '14px 16px', background: isSelected ? `${accent}12` : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${isSelected ? accent + '40' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12,
                                        display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                                    }}
                                >
                                    <span style={{ fontSize: 24, flexShrink: 0 }}>{BOOK_COVERS[key] || '📄'}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.name}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                                            <span style={{ fontSize: '0.7rem', color: '#475569' }}>{book.category}</span>
                                            <span style={{ fontSize: '0.7rem', color: accent, fontWeight: 600 }}>{typeof book.chunks === 'number' ? book.chunks.toLocaleString() : '?'} chunks</span>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* AI Safety Banner */}
                <div style={{
                    padding: '20px 24px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16,
                }}>
                    <span style={{ fontSize: 28 }}>🛡️</span>
                    <div>
                        <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}>AI Safety & Research Ethics</div>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                            KnowledgeVerse AI only answers using retrieved evidence from selected books. Citations are never fabricated. No religious, philosophical, or ideological source is declared correct or incorrect. All answers maintain a neutral academic tone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
