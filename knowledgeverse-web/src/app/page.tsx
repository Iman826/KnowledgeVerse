'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const FEATURES = [
  {
    icon: '🔬',
    title: 'Multi-Book RAG',
    description: 'Retrieve and compare knowledge from multiple books simultaneously with semantic precision.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: '🔗',
    title: 'Exact Citations',
    description: 'Every answer is grounded in retrieved evidence with chapter, verse, and passage references.',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    icon: '🧠',
    title: 'AI Insights',
    description: 'Automatically generated executive summaries, common themes, and unique perspectives.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: '📊',
    title: 'Consensus Analysis',
    description: 'Thematic overlap meter shows semantic similarity across selected sources neutrally.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: '🕸️',
    title: 'Knowledge Graph',
    description: 'Interactive concept graph mapping relationships between ideas across your sources.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: '📋',
    title: 'Citation Explorer',
    description: 'Deep-dive into exact passages with confidence scores and AI-generated explanations.',
    gradient: 'from-cyan-500 to-sky-600',
  },
];

const SUPPORTED_BOOKS = [
  { icon: '📖', name: 'Quran', color: '#10b981' },
  { icon: '✝️', name: 'Bible', color: '#3b82f6' },
  { icon: '✡️', name: 'Torah', color: '#f59e0b' },
  { icon: '🕉️', name: 'Bhagavad Gita', color: '#f97316' },
  { icon: '☸️', name: 'Dhammapada', color: '#8b5cf6' },
  { icon: '☪️', name: 'Hadith', color: '#22c55e' },
  { icon: '🏛️', name: 'Constitution', color: '#6b7280' },
  { icon: '📄', name: 'Research Papers', color: '#ec4899' },
  { icon: '📁', name: 'Uploaded PDFs', color: '#6366f1' },
];

const TYPING_TEXTS = [
  'What does justice mean across different traditions?',
  'Compare mercy and forgiveness in religious texts.',
  'How do these books define leadership?',
  'Find common themes about equality and human dignity.',
];

function TypingAnimation() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = TYPING_TEXTS[textIndex];
    const speed = isDeleting ? 30 : 60;
    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setDisplayText(current.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      } else if (!isDeleting && charIndex === current.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(current.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTextIndex((i) => (i + 1) % TYPING_TEXTS.length);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <span style={{ color: '#818cf8' }}>
      {displayText}
      <span style={{ animation: 'blink 1s step-end infinite', borderRight: '2px solid #818cf8', marginLeft: 2 }} />
    </span>
  );
}

function Particle({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.5), rgba(139,92,246,0))',
        opacity,
        pointerEvents: 'none',
        animation: `float-orb ${5 + Math.random() * 5}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 3}s`,
      }}
    />
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 40 + Math.random() * 120,
      opacity: 0.1 + Math.random() * 0.25,
    }))
  );
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const el = heroRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      if (!el) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      el.style.setProperty('--mouse-x', `${x * 20}px`);
      el.style.setProperty('--mouse-y', `${y * 20}px`);
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#070711', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(7, 7, 17, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🔮</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif' }}>
            KnowledgeVerse <span style={{ color: '#818cf8' }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => router.push('/library')}
            style={{ padding: '8px 18px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', borderRadius: 8, fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >Library</button>
          <button
            onClick={() => router.push('/workspace')}
            style={{ padding: '8px 18px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', borderRadius: 8, fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >Workspace</button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ padding: '8px 18px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', borderRadius: 8, fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >Dashboard</button>
          <button
            onClick={() => router.push('/workspace')}
            style={{
              padding: '9px 22px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none', cursor: 'pointer',
              borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
              transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(99,102,241,0.5)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.3)'; }}
          >Start Research</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 40px 80px', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {particles.map((p) => <Particle key={p.id} {...p} />)}
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)', top: '10%', left: '20%', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent)', bottom: '10%', right: '15%', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent)', top: '40%', right: '30%', filter: 'blur(50px)' }} />
        </div>

        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 100, marginBottom: 32,
          animation: 'fade-in 0.6s ease forwards',
          position: 'relative', zIndex: 10,
        }}>
          <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, letterSpacing: '0.05em' }}>✨ AI-POWERED RESEARCH PLATFORM</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          maxWidth: 900,
          position: 'relative', zIndex: 10,
          animation: 'fade-in 0.8s ease 0.2s both',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          <span style={{ color: '#f1f5f9' }}>Knowledge</span>
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Verse</span>
          <span style={{ color: '#f1f5f9' }}> AI</span>
        </h1>

        {/* Tagline */}
        <p style={{
          marginTop: 24,
          fontSize: 'clamp(1rem, 2vw, 1.3rem)',
          color: '#94a3b8',
          textAlign: 'center',
          maxWidth: 680,
          lineHeight: 1.7,
          position: 'relative', zIndex: 10,
          animation: 'fade-in 0.8s ease 0.4s both',
        }}>
          Compare knowledge across books with <strong style={{ color: '#c4b5fd' }}>trustworthy AI-powered citations</strong>.<br />
          Multi-source RAG. Exact references. Neutral academic tone.
        </p>

        {/* Typing Demo */}
        <div style={{
          marginTop: 40,
          padding: '20px 28px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 16,
          maxWidth: 680,
          width: '100%',
          position: 'relative', zIndex: 10,
          animation: 'fade-in 0.8s ease 0.5s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>Ask anything across your selected books</span>
          </div>
          <div style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 500, minHeight: 28 }}>
            <TypingAnimation />
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: 16, marginTop: 40,
          position: 'relative', zIndex: 10,
          animation: 'fade-in 0.8s ease 0.6s both',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <button
            onClick={() => router.push('/workspace')}
            style={{
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none', cursor: 'pointer',
              borderRadius: 14, fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
              transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 16px 50px rgba(99,102,241,0.6)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(99,102,241,0.4)'; }}
          >
            🚀 Start Research
          </button>
          <button
            onClick={() => router.push('/library')}
            style={{
              padding: '14px 32px',
              background: 'rgba(255,255,255,0.05)', color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer',
              borderRadius: 14, fontWeight: 600, fontSize: '1rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.5)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.3)'; }}
          >
            📚 Browse Library
          </button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex', gap: 48, marginTop: 64,
          position: 'relative', zIndex: 10,
          animation: 'fade-in 0.8s ease 0.8s both',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { value: '9+', label: 'Books & Texts' },
            { value: '50K+', label: 'Indexed Chunks' },
            { value: '100%', label: 'Cited Answers' },
            { value: '0', label: 'Hallucinations' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8', fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 2, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section style={{ padding: '100px 40px', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>CAPABILITIES</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
            Everything you need for<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>deep comparative research</span>
          </h2>
          <p style={{ marginTop: 16, color: '#64748b', maxWidth: 500, margin: '16px auto 0', lineHeight: 1.6 }}>
            Built for scholars, researchers, educators, and curious minds who demand precision and transparency.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24, maxWidth: 1100, margin: '0 auto',
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass-card feature-card"
              style={{
                padding: 28,
                animation: `fade-in 0.6s ease ${i * 0.1}s both`,
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `linear-gradient(135deg, ${f.gradient.split('from-')[1]?.split(' ')[0]?.replace('-500', '')}-500, ${f.gradient.split('to-')[1]?.split(' ')[0]?.replace('-600', '')}-600)`.replace(/undefined/g, ''),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Books */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>LIBRARY</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
            Supported Books & Texts
          </h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 800, margin: '0 auto' }}>
          {SUPPORTED_BOOKS.map((book) => (
            <div
              key={book.name}
              className="glass-card-sm"
              style={{
                padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.borderColor = book.color + '50';
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 10px 30px ${book.color}20`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.2)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 22 }}>{book.icon}</span>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{book.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: book.color }} />
                  <span style={{ fontSize: '0.7rem', color: '#475569' }}>Indexed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '100px 40px', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>PIPELINE</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
            How KnowledgeVerse AI Works
          </h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, maxWidth: 900, margin: '0 auto', flexWrap: 'wrap' }}>
          {[
            { step: '01', title: 'Select Books', desc: 'Choose which books to search. Only selected sources are queried.', icon: '📚' },
            { step: '02', title: 'Ask a Question', desc: 'Type your research question in natural language.', icon: '💬' },
            { step: '03', title: 'RAG Retrieval', desc: 'Semantically similar passages are retrieved from ChromaDB.', icon: '🔍' },
            { step: '04', title: 'LLM Analysis', desc: 'AI generates answers based only on retrieved evidence.', icon: '🤖' },
            { step: '05', title: 'Cited Answers', desc: 'Every response includes exact book, chapter, and verse.', icon: '📎' },
          ].map((item, i) => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className="glass-card"
                style={{ padding: '24px 20px', textAlign: 'center', maxWidth: 160, position: 'relative' }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>{item.step}</div>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
              {i < 4 && (
                <div style={{ color: '#334155', fontSize: '1.5rem', padding: '0 8px' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto',
          padding: '60px 40px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12), transparent)', borderRadius: 24 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🔮</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 16 }}>
              Ready to explore knowledge?
            </h2>
            <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 32, fontSize: '1rem' }}>
              Start your research session and discover connections across books with AI-powered precision.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/workspace')}
                style={{
                  padding: '14px 36px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', border: 'none', cursor: 'pointer', borderRadius: 14,
                  fontWeight: 700, fontSize: '1rem', boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
              >
                🚀 Start Researching
              </button>
              <button
                onClick={() => router.push('/library')}
                style={{
                  padding: '14px 28px', background: 'transparent', color: '#94a3b8',
                  border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', borderRadius: 14,
                  fontWeight: 600, fontSize: '1rem', transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.6)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.3)'; }}
              >
                Browse Library
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', borderTop: '1px solid rgba(99,102,241,0.1)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔮</div>
          <span style={{ fontWeight: 700, color: '#e2e8f0' }}>KnowledgeVerse AI</span>
        </div>
        <p style={{ color: '#334155', fontSize: '0.85rem' }}>
          AI-Powered Comparative Research Platform · Built with ❤️ for scholars worldwide
        </p>
      </footer>
    </div>
  );
}
