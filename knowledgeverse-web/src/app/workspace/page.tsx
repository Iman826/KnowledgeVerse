'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, ResearchResult, BookResult } from '@/store/appStore';
import { fetchResearch, fetchComparison, fetchKnowledgeGraph, BOOK_COVERS, BOOK_ACCENT, getOverlapLabel } from '@/lib/utils';

// ─── Subcomponents ────────────────────────────────────────────────────────────
function AnswerCard({ result }: { result: BookResult }) {
    const [expanded, setExpanded] = useState(false);
    const accent = BOOK_ACCENT[result.book_key] || '#6366f1';
    const conf = result.citation.confidence;
    const confColor = conf > 0.9 ? '#34d399' : conf > 0.75 ? '#fbbf24' : '#f87171';

    return (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', background: `linear-gradient(90deg, ${accent}18, transparent)`, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{BOOK_COVERS[result.book_key] || '📄'}</span>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1rem' }}>{result.book_name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                        {result.citation.chapter} · {result.citation.verse}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Confidence */}
                    <div style={{ textAlign: 'center' }}>
                        <svg width="44" height="44" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                            <circle cx="22" cy="22" r="18" fill="none" stroke={confColor} strokeWidth="4"
                                strokeDasharray={`${conf * 113.1} 113.1`} strokeLinecap="round"
                                transform="rotate(-90 22 22)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                            <text x="22" y="26" textAnchor="middle" fill={confColor} fontSize="9" fontWeight="700">{Math.round(conf * 100)}%</text>
                        </svg>
                        <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: 1 }}>Conf.</div>
                    </div>
                    {/* Similarity */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ padding: '4px 8px', background: `${accent}20`, border: `1px solid ${accent}40`, borderRadius: 8, fontSize: '0.75rem', color: accent, fontWeight: 700 }}>
                            {(result.citation.similarity * 100).toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: 2 }}>Sim.</div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div style={{ padding: '16px 20px 0' }}>
                <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, marginBottom: 6, letterSpacing: '0.04em' }}>SUMMARY</div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.65 }}>{result.summary}</p>
            </div>

            {/* Citation */}
            <div style={{ margin: '16px 20px 0', padding: 16, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 12, borderLeft: `3px solid ${accent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: '0.75rem', color: accent, fontWeight: 600 }}>RETRIEVED EVIDENCE</div>
                    <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                        {result.citation.chapter} · <span style={{ color: accent }}>{result.citation.verse}</span>
                    </div>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                    &ldquo;{expanded ? result.citation.text : result.citation.text.slice(0, 120) + (result.citation.text.length > 120 ? '…' : '')}&rdquo;
                </p>
                {result.citation.text.length > 120 && (
                    <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 8, background: 'none', border: 'none', color: accent, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                        {expanded ? '↑ Show less' : '↓ Read full passage'}
                    </button>
                )}
            </div>

            {/* Unique Perspective */}
            <div style={{ padding: '12px 20px 16px' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.55 }}>
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>Unique perspective: </span>
                    {result.unique_perspective}
                </div>
            </div>
        </div>
    );
}

function ThematicOverlapMeter({ score }: { score: number }) {
    const { label, icon, color } = getOverlapLabel(score);
    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    const progress = score * circumference;
    return (
        <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 20 }}>THEMATIC OVERLAP METER</div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <circle cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth="10"
                        strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
                        transform="rotate(-90 80 80)" className="meter-ring" style={{ transition: 'stroke-dasharray 1s ease' }} />
                    <text x="80" y="72" textAnchor="middle" fill={color} fontSize="20" fontWeight="800">
                        {Math.round(score * 100)}%
                    </text>
                    <text x="80" y="92" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="500">similarity</text>
                </svg>
            </div>
            <div style={{ marginTop: 16, fontSize: '1rem', fontWeight: 700, color }}>
                {icon} {label}
            </div>
            <div style={{ marginTop: 10, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, maxWidth: 280, margin: '10px auto 0' }}>
                Most selected sources discuss the topic using similar themes while differing in their theological or philosophical foundations.
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20 }}>
                {[{ c: '#34d399', l: 'High' }, { c: '#fbbf24', l: 'Moderate' }, { c: '#f87171', l: 'Low' }, { c: '#94a3b8', l: 'None' }].map(({ c, l }) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                        <span style={{ fontSize: '0.72rem', color: '#475569' }}>{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ComparisonTable({ data }: { data: { question: string; comparison_table: Array<{ book: string; book_key: string; main_idea: string; evidence: string; citation: string; similarity: number; difference: string }> } }) {
    return (
        <div className="glass-card" style={{ padding: 24, overflowX: 'auto' }}>
            <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 20 }}>COMPARISON TABLE</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                    <tr>
                        {['Book', 'Main Idea', 'Evidence', 'Citation', 'Similarity'].map((h) => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(99,102,241,0.1)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.comparison_table.map((row, i) => {
                        const accent = BOOK_ACCENT[row.book_key] || '#6366f1';
                        return (
                            <tr key={i} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 18 }}>{BOOK_COVERS[row.book_key] || '📄'}</span>
                                        <span style={{ color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.book}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#94a3b8', maxWidth: 200 }}>{row.main_idea}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#64748b', maxWidth: 200 }}>{row.evidence}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)', whiteSpace: 'nowrap' }}>
                                    <span style={{ color: accent, fontSize: '0.78rem', fontWeight: 600 }}>{row.citation}</span>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${row.similarity * 100}%`, background: accent, borderRadius: 2 }} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: accent, fontWeight: 600 }}>{(row.similarity * 100).toFixed(0)}%</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function KnowledgeGraphViz({ data }: { data: { topic: string; nodes: Array<{ id: string; label: string; type: string; size: number }>; links: Array<{ source: string; target: string; weight: number }> } }) {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const width = 420, height = 320;
    const cx = width / 2, cy = height / 2;

    const positions: Record<string, { x: number; y: number }> = {};
    data.nodes.forEach((node, i) => {
        if (i === 0) { positions[node.id] = { x: cx, y: cy }; return; }
        const angle = ((i - 1) / (data.nodes.length - 1)) * Math.PI * 2;
        const r = 115;
        positions[node.id] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    });

    return (
        <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 16 }}>KNOWLEDGE GRAPH — {data.topic.toUpperCase()}</div>
            <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ maxHeight: 320 }}>
                <defs>
                    <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </radialGradient>
                </defs>
                {data.links.map((link, i) => {
                    const s = positions[link.source];
                    const t = positions[link.target];
                    if (!s || !t) return null;
                    return (
                        <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                            stroke={`rgba(99,102,241,${link.weight * 0.6})`} strokeWidth={link.weight * 2.5}
                            strokeDasharray={hoveredNode ? undefined : undefined}
                        />
                    );
                })}
                {data.nodes.map((node) => {
                    const pos = positions[node.id];
                    if (!pos) return null;
                    const isCore = node.type === 'core';
                    const isHovered = hoveredNode === node.id;
                    return (
                        <g key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: 'pointer' }}>
                            <circle cx={pos.x} cy={pos.y} r={isCore ? 24 : 16}
                                fill={isCore ? 'url(#nodeGrad)' : isHovered ? '#6366f1' : 'rgba(99,102,241,0.4)'}
                                stroke={isHovered ? '#a5b4fc' : 'rgba(99,102,241,0.6)'}
                                strokeWidth={isCore ? 2 : 1.5}
                                style={{ transition: 'all 0.2s' }}
                            />
                            {isCore && <circle cx={pos.x} cy={pos.y} r={30} fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1" style={{ animation: 'pulse-ring 3s infinite' }} />}
                            <text x={pos.x} y={pos.y + (isCore ? 38 : 28)} textAnchor="middle" fill={isHovered ? '#a5b4fc' : '#94a3b8'} fontSize={isCore ? 11 : 9.5} fontWeight={isCore ? '700' : '500'}>
                                {node.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div style={{ fontSize: '0.78rem', color: '#475569', textAlign: 'center', marginTop: 8 }}>
                Hover over nodes to explore concepts · Line weight = relationship strength
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
            </div>
            <div className="skeleton" style={{ height: 14, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '70%' }} />
        </div>
    );
}

const SEARCH_MODES = [
    { id: 'normal', label: 'Research', icon: '🔍' },
    { id: 'compare', label: 'Compare', icon: '⚖️' },
    { id: 'deep', label: 'Deep Research', icon: '🧬' },
    { id: 'scholar', label: 'Scholar Mode', icon: '🎓' },
];

const QUICK_QUESTIONS = [
    'What is the meaning of justice?',
    'Compare mercy and forgiveness.',
    'How is prayer described?',
    'What does it say about leadership?',
    'Compare views on equality.',
    'What is said about peace?',
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkspacePage() {
    const router = useRouter();
    const {
        selectedBooks, availableBooks,
        currentResult, setCurrentResult,
        addToHistory, researchHistory, isLoading, setLoading,
        addBookmark, bookmarks,
        sidebarOpen, setSidebarOpen,
        activeTab, setActiveTab,
    } = useAppStore();

    const [question, setQuestion] = useState('');
    const [mode, setMode] = useState('normal');
    const [comparisonData, setComparisonData] = useState<{ question: string; comparison_table: Array<{ book: string; book_key: string; main_idea: string; evidence: string; citation: string; similarity: number; difference: string }> } | null>(null);
    const [graphData, setGraphData] = useState<{ topic: string; nodes: Array<{ id: string; label: string; type: string; size: number }>; links: Array<{ source: string; target: string; weight: number }> } | null>(null);
    const [statusMsg, setStatusMsg] = useState('');

    const handleResearch = useCallback(async () => {
        if (!question.trim()) return;
        if (selectedBooks.length === 0) { alert('Please select at least one book in the Library first.'); router.push('/library'); return; }

        setLoading(true);
        setCurrentResult(null);
        setComparisonData(null);
        setGraphData(null);
        setActiveTab('results');

        try {
            setStatusMsg('Searching selected books...');
            const result = await fetchResearch(question, selectedBooks, mode);
            setCurrentResult(result);
            addToHistory(result);

            if (mode === 'compare') {
                setStatusMsg('Generating comparison table...');
                const cmp = await fetchComparison(question, selectedBooks);
                setComparisonData(cmp);
            }

            setStatusMsg('Generating knowledge graph...');
            const keywords = question.split(' ').filter((w) => w.length > 3).slice(0, 3).join(' ') || question;
            const graph = await fetchKnowledgeGraph(keywords, selectedBooks);
            setGraphData(graph);
        } catch {
            // Backend not running - use demo data
            const demoResult: ResearchResult = {
                question,
                results: selectedBooks.slice(0, 3).map((book_key) => ({
                    book_key,
                    book_name: availableBooks[book_key]?.name || book_key,
                    summary: `According to ${availableBooks[book_key]?.name || book_key}, this topic is addressed through its foundational principles and teachings. The source provides a nuanced perspective rooted in its unique tradition.`,
                    explanation: 'This source provides a comprehensive perspective drawing from its core teachings.',
                    citation: { chapter: 'Chapter 1', verse: 'Verse 1', text: 'This is a retrieved passage relevant to your question. Please connect the backend API for exact citations.', confidence: 0.87, similarity: 0.84 },
                    main_idea: 'Core teaching on this topic.',
                    unique_perspective: 'Unique contribution from this tradition.',
                })),
                thematic_overlap_score: 0.72,
                overlap_category: 'High Thematic Overlap',
                insights: {
                    executive_summary: `Cross-source analysis of "${question}" reveals significant thematic overlap with distinct theological and philosophical nuances across the selected sources.`,
                    common_themes: ['Justice', 'Mercy', 'Moral Responsibility'],
                    unique_perspectives: selectedBooks.map((b) => `${availableBooks[b]?.name || b} offers a unique perspective.`),
                    historical_context: 'This concept has been central across human civilizations.',
                    modern_relevance: 'Understanding multiple perspectives promotes cross-cultural dialogue.',
                    follow_up_questions: [`How do these sources define ${question.split(' ').slice(0, 3).join(' ')}?`, 'What historical context shapes these views?', 'How do these traditions differ in their approach?'],
                },
                source_coverage: { selected: selectedBooks.length, with_evidence: selectedBooks.length, without_evidence: 0 },
            };
            setCurrentResult(demoResult);
            addToHistory(demoResult);
        } finally {
            setLoading(false);
            setStatusMsg('');
        }
    }, [question, selectedBooks, mode, setLoading, setCurrentResult, addToHistory, setActiveTab, router, availableBooks]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleResearch();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleResearch]);

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#070711', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
            {/* ── Sidebar ─────────────────────────────────────────────────────── */}
            <div style={{
                width: sidebarOpen ? 280 : 0, minWidth: sidebarOpen ? 280 : 0,
                borderRight: '1px solid rgba(99,102,241,0.12)', padding: sidebarOpen ? '0 0 0 0' : 0,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                transition: 'all 0.3s ease',
                background: 'rgba(7,7,17,0.95)',
            }}>
                {sidebarOpen && (
                    <>
                        {/* Brand */}
                        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                            <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}>
                                <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔮</div>
                                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>KnowledgeVerse AI</span>
                            </button>

                            {/* Selected Books */}
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>SELECTED BOOKS ({selectedBooks.length})</div>
                                {selectedBooks.length === 0 ? (
                                    <button onClick={() => router.push('/library')} style={{ width: '100%', padding: '10px', background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 8, cursor: 'pointer', color: '#818cf8', fontSize: '0.8rem', textAlign: 'center' }}>
                                        + Select books in Library
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {selectedBooks.map((k) => (
                                            <span key={k} style={{ padding: '3px 8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, fontSize: '0.72rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span>{BOOK_COVERS[k] || '📄'}</span>
                                                <span>{availableBooks[k]?.name?.split(' ')[0] || k}</span>
                                            </span>
                                        ))}
                                        <button onClick={() => router.push('/library')} style={{ padding: '3px 8px', background: 'transparent', border: '1px dashed rgba(99,102,241,0.2)', borderRadius: 8, fontSize: '0.72rem', color: '#475569', cursor: 'pointer' }}>+ Edit</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* History */}
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '14px 20px 10px', fontSize: '0.7rem', color: '#475569', fontWeight: 600, letterSpacing: '0.06em' }}>RECENT RESEARCH</div>
                            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
                                {researchHistory.length === 0 ? (
                                    <div style={{ padding: '20px 8px', color: '#334155', fontSize: '0.8rem', textAlign: 'center' }}>No research history yet</div>
                                ) : (
                                    researchHistory.map((r, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setCurrentResult(r)}
                                            style={{
                                                padding: '10px 8px', marginBottom: 2, borderRadius: 8, cursor: 'pointer',
                                                background: currentResult?.question === r.question ? 'rgba(99,102,241,0.12)' : 'transparent',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={(e) => { if (currentResult?.question !== r.question) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                                            onMouseLeave={(e) => { if (currentResult?.question !== r.question) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                                        >
                                            <div style={{ color: '#cbd5e1', fontSize: '0.83rem', fontWeight: 500, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {r.question}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#334155' }}>
                                                {r.results.length} source{r.results.length !== 1 ? 's' : ''} · {Math.round(r.thematic_overlap_score * 100)}% overlap
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Bookmarks count */}
                            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>🔖 Bookmarks</span>
                                    <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>{bookmarks.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Settings Nav */}
                        <div style={{ padding: '12px 12px', borderTop: '1px solid rgba(99,102,241,0.08)', display: 'flex', gap: 6 }}>
                            <button onClick={() => router.push('/library')} style={{ flex: 1, padding: '8px', background: 'rgba(99,102,241,0.08)', border: 'none', cursor: 'pointer', borderRadius: 8, color: '#818cf8', fontSize: '0.75rem', fontWeight: 500 }}>📚 Library</button>
                            <button onClick={() => router.push('/dashboard')} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.04)', border: 'none', cursor: 'pointer', borderRadius: 8, color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>📊 Dashboard</button>
                        </div>
                    </>
                )}
            </div>

            {/* ── Main Area ───────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top Bar */}
                <div style={{
                    padding: '12px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'rgba(7,7,17,0.9)', backdropFilter: 'blur(10px)',
                }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, cursor: 'pointer', color: '#64748b', fontSize: 16 }}>
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>Research Workspace</div>
                    <div style={{ flex: 1 }} />
                    {selectedBooks.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                            🔍 Searching in: <span style={{ color: '#818cf8', fontWeight: 600 }}>{selectedBooks.length} book{selectedBooks.length > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    <button onClick={() => router.push('/library')} style={{ padding: '7px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                        📚 Manage Books
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(99,102,241,0.08)', background: 'rgba(0,0,0,0.15)' }}>
                    {/* Mode tabs */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                        {SEARCH_MODES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                style={{
                                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                                    background: mode === m.id ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                                    color: mode === m.id ? '#818cf8' : '#475569',
                                    outline: mode === m.id ? '1px solid rgba(99,102,241,0.35)' : 'none',
                                }}
                            >{m.icon} {m.label}</button>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleResearch(); } }}
                            placeholder="Ask anything across your selected books...  (Enter to search, Shift+Enter for new line)"
                            className="input-glass"
                            style={{ flex: 1, padding: '14px 18px', fontSize: '0.95rem', resize: 'none', height: 70, lineHeight: 1.6 }}
                        />
                        <button
                            onClick={handleResearch}
                            disabled={isLoading || !question.trim()}
                            style={{
                                padding: '14px 28px', height: 70,
                                background: isLoading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                                borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
                                transition: 'all 0.3s',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span style={{ fontSize: 18, animation: 'spin-slow 1.5s linear infinite', display: 'inline-block' }}>⟳</span>
                                    <span style={{ fontSize: '0.7rem' }}>Searching</span>
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: 18 }}>🔍</span>
                                    <span style={{ fontSize: '0.75rem' }}>Research</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Status message during loading */}
                    {statusMsg && (
                        <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, background: '#6366f1', borderRadius: '50%', display: 'inline-block', animation: 'pulse-ring 1s infinite' }} />
                            {statusMsg}
                        </div>
                    )}

                    {/* Quick questions */}
                    {!currentResult && !isLoading && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            {QUICK_QUESTIONS.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => { setQuestion(q); }}
                                    style={{
                                        padding: '5px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.12)',
                                        borderRadius: 100, color: '#475569', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#818cf8'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}
                                >{q}</button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Results Area */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Tabs */}
                    {(currentResult || isLoading) && (
                        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(99,102,241,0.08)', background: 'rgba(0,0,0,0.1)' }}>
                            {[
                                { id: 'results', label: '📄 Results', count: currentResult?.results.length },
                                { id: 'compare', label: '⚖️ Comparison' },
                                { id: 'insights', label: '💡 AI Insights' },
                                { id: 'graph', label: '🕸️ Knowledge Graph' },
                                { id: 'coverage', label: '📊 Coverage' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        padding: '12px 16px', background: 'none', border: 'none',
                                        borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                                        color: activeTab === tab.id ? '#818cf8' : '#475569',
                                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                                    }}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span style={{ marginLeft: 6, background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '1px 6px', borderRadius: 100, fontSize: '0.7rem' }}>{tab.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                        {/* Empty state */}
                        {!currentResult && !isLoading && (
                            <div style={{ textAlign: 'center', padding: '80px 40px' }}>
                                <div style={{ fontSize: 56, marginBottom: 20 }}>🔮</div>
                                <h2 style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '1.3rem', marginBottom: 10 }}>Begin Your Research</h2>
                                <p style={{ color: '#334155', maxWidth: 420, margin: '0 auto', lineHeight: 1.6, fontSize: '0.9rem' }}>
                                    {selectedBooks.length === 0
                                        ? 'Select books from the Library, then ask any question to compare knowledge across sources.'
                                        : `You have ${selectedBooks.length} book${selectedBooks.length > 1 ? 's' : ''} selected. Type a question above to start your research.`}
                                </p>
                                {selectedBooks.length === 0 && (
                                    <button onClick={() => router.push('/library')} style={{ marginTop: 20, padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 10, fontWeight: 600 }}>
                                        📚 Go to Library
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Loading skeletons */}
                        {isLoading && !currentResult && (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                                {selectedBooks.length > 2 && <SkeletonCard />}
                            </>
                        )}

                        {/* Results Tab */}
                        {currentResult && activeTab === 'results' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <div>
                                        <h2 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{currentResult.question}</h2>
                                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                            {currentResult.results.length} source{currentResult.results.length !== 1 ? 's' : ''} with evidence · {Math.round(currentResult.thematic_overlap_score * 100)}% thematic overlap
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addBookmark(currentResult)}
                                        style={{ padding: '7px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                                    >🔖 Bookmark</button>
                                </div>
                                {currentResult.results.map((r) => <AnswerCard key={r.book_key} result={r} />)}
                            </div>
                        )}

                        {/* Compare Tab */}
                        {currentResult && activeTab === 'compare' && (
                            <div>
                                <div style={{ marginBottom: 20 }}>
                                    <h2 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>Comparative Analysis</h2>
                                    <p style={{ color: '#475569', fontSize: '0.85rem' }}>Side-by-side comparison of how each source addresses the question.</p>
                                </div>
                                <div style={{ marginBottom: 24 }}>
                                    <ThematicOverlapMeter score={currentResult.thematic_overlap_score} />
                                </div>
                                {comparisonData ? (
                                    <ComparisonTable data={comparisonData} />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40 }}>
                                        <button onClick={async () => {
                                            try {
                                                const cmp = await fetchComparison(currentResult.question, selectedBooks);
                                                setComparisonData(cmp);
                                            } catch {
                                                setComparisonData({
                                                    question: currentResult.question,
                                                    comparison_table: currentResult.results.map((r) => ({
                                                        book: r.book_name, book_key: r.book_key, main_idea: r.main_idea,
                                                        evidence: r.citation.text.slice(0, 100) + '...', citation: `${r.citation.chapter} · ${r.citation.verse}`,
                                                        similarity: r.citation.similarity, difference: r.unique_perspective,
                                                    })),
                                                });
                                            }
                                        }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 10, fontWeight: 600 }}>
                                            ⚖️ Generate Comparison Table
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Insights Tab */}
                        {currentResult && activeTab === 'insights' && (
                            <div style={{ display: 'grid', gap: 16 }}>
                                <div className="glass-card" style={{ padding: 24 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 12 }}>EXECUTIVE SUMMARY</div>
                                    <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.9rem' }}>{currentResult.insights.executive_summary}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                                    <div className="glass-card" style={{ padding: 20 }}>
                                        <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>🔗 COMMON THEMES</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {currentResult.insights.common_themes.map((t) => (
                                                <span key={t} className="badge badge-purple">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="glass-card" style={{ padding: 20 }}>
                                        <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>⏳ HISTORICAL CONTEXT</div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6 }}>{currentResult.insights.historical_context}</p>
                                    </div>
                                    <div className="glass-card" style={{ padding: 20 }}>
                                        <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>🌐 MODERN RELEVANCE</div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6 }}>{currentResult.insights.modern_relevance}</p>
                                    </div>
                                </div>
                                <div className="glass-card" style={{ padding: 20 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>❓ FOLLOW-UP QUESTIONS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {currentResult.insights.follow_up_questions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setQuestion(q); setActiveTab('results'); }}
                                                style={{
                                                    padding: '10px 16px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
                                                    borderRadius: 10, color: '#94a3b8', cursor: 'pointer', textAlign: 'left',
                                                    fontSize: '0.85rem', transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#c4b5fd'; }}
                                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                                            >
                                                → {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Knowledge Graph Tab */}
                        {currentResult && activeTab === 'graph' && (
                            <div>
                                <div style={{ marginBottom: 20 }}>
                                    <h2 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>Interactive Knowledge Graph</h2>
                                    <p style={{ color: '#475569', fontSize: '0.85rem' }}>Conceptual relationships extracted from the research.</p>
                                </div>
                                {graphData ? (
                                    <KnowledgeGraphViz data={graphData} />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40 }}>
                                        <button onClick={async () => {
                                            try {
                                                const kw = currentResult.question.split(' ').filter((w) => w.length > 3).slice(0, 3).join(' ');
                                                const graph = await fetchKnowledgeGraph(kw, selectedBooks);
                                                setGraphData(graph);
                                            } catch {
                                                setGraphData({
                                                    topic: currentResult.question.split(' ').slice(0, 2).join(' '),
                                                    nodes: [
                                                        { id: '1', label: currentResult.question.split(' ').slice(0, 2).join(' '), type: 'core', size: 20 },
                                                        { id: '2', label: 'Justice', type: 'concept', size: 14 },
                                                        { id: '3', label: 'Mercy', type: 'concept', size: 14 },
                                                        { id: '4', label: 'Duty', type: 'concept', size: 12 },
                                                        { id: '5', label: 'Truth', type: 'concept', size: 12 },
                                                        { id: '6', label: 'Peace', type: 'concept', size: 11 },
                                                    ],
                                                    links: [{ source: '1', target: '2', weight: 0.9 }, { source: '1', target: '3', weight: 0.8 }, { source: '2', target: '4', weight: 0.7 }, { source: '3', target: '5', weight: 0.6 }, { source: '4', target: '6', weight: 0.5 }],
                                                });
                                            }
                                        }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 10, fontWeight: 600 }}>
                                            🕸️ Generate Knowledge Graph
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Coverage Tab */}
                        {currentResult && activeTab === 'coverage' && (
                            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                                {[
                                    { label: 'Books Selected', value: currentResult.source_coverage.selected, color: '#818cf8', icon: '📚' },
                                    { label: 'With Evidence', value: currentResult.source_coverage.with_evidence, color: '#34d399', icon: '✅' },
                                    { label: 'No Evidence', value: currentResult.source_coverage.without_evidence, color: '#f87171', icon: '❌' },
                                    { label: 'Overlap Score', value: `${Math.round(currentResult.thematic_overlap_score * 100)}%`, color: '#fbbf24', icon: '🔄' },
                                ].map(({ label, value, color, icon }) => (
                                    <div key={label} className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color, marginBottom: 4, fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
                                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{label}</div>
                                    </div>
                                ))}
                                <div className="glass-card" style={{ padding: 20, gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>SOURCE BREAKDOWN</div>
                                    {currentResult.results.map((r) => (
                                        <div key={r.book_key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                            <span style={{ fontSize: 20 }}>{BOOK_COVERS[r.book_key] || '📄'}</span>
                                            <span style={{ color: '#e2e8f0', fontWeight: 600, width: 140, fontSize: '0.85rem', flexShrink: 0 }}>{r.book_name}</span>
                                            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${r.citation.similarity * 100}%`, background: BOOK_ACCENT[r.book_key] || '#6366f1', borderRadius: 3 }} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: BOOK_ACCENT[r.book_key] || '#6366f1', fontWeight: 600, width: 36, textAlign: 'right' }}>{(r.citation.similarity * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
