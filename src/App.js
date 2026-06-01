import React, { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';

function MagneticCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const target = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const raf = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e) => { target.current = { x: e.clientX, y: e.clientY }; };
    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);
    window.addEventListener('mousemove', move);
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${pos.current.x}px,${pos.current.y}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${target.current.x}px,${target.current.y}px)`;
      raf.current = requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseenter', onEnter, true);
    document.addEventListener('mouseleave', onLeave, true);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <>
      <div ref={cursorRef} className={`cursor-ring ${hovered ? 'cursor-hover' : ''}`} />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);
  const handleMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) scale(1.025)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);
  return (
    <div ref={cardRef} className={`tilt-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

function SkillBar({ name, level, color, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className="skill-row">
      <div className="skill-meta">
        <span className="skill-name">{name}</span>
        <span className="skill-pct" style={{ color }}>{level}%</span>
      </div>
      <div className="skill-track">
        <div className="skill-fill" style={{ width: visible ? `${level}%` : '0%', background: color, transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

function GlitchText({ text }) {
  return <span className="glitch" data-text={text}>{text}</span>;
}

function Typewriter({ strings, speed = 75 }) {
  const [display, setDisplay] = useState('');
  const [si, setSi] = useState(0);
  const [ci, setCi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = strings[si];
    let t;
    if (!deleting && ci < current.length) {
      t = setTimeout(() => { setDisplay(current.slice(0, ci + 1)); setCi(c => c + 1); }, speed);
    } else if (!deleting && ci === current.length) {
      t = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && ci > 0) {
      t = setTimeout(() => { setDisplay(current.slice(0, ci - 1)); setCi(c => c - 1); }, speed / 2);
    } else {
      setDeleting(false); setSi(s => (s + 1) % strings.length);
    }
    return () => clearTimeout(t);
  }, [ci, deleting, si, strings, speed]);
  return <span className="typewriter">{display}<span className="caret">|</span></span>;
}

function ProjectCard({ title, tech, desc, tag, href, delay }) {
  return (
    <Reveal delay={delay}>
      <TiltCard>
        <div className="proj-tag">{tag}</div>
        <h3 className="proj-title">{title}</h3>
        <p className="proj-desc">{desc}</p>
        <div className="proj-tech">
          {tech.map(t => <span key={t} className="tech-badge">{t}</span>)}
        </div>
        {href && <a href={href} target="_blank" rel="noreferrer" className="proj-link">View on GitHub →</a>}
      </TiltCard>
    </Reveal>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const skills = [
    { name: 'React / Next.js', level: 95, color: '#61DAFB' },
    { name: 'TypeScript', level: 90, color: '#3178C6' },
    { name: 'Node.js', level: 82, color: '#8CC84B' },
    { name: 'AI Tooling — Claude · Copilot · Cursor', level: 88, color: '#F5A623' },
    { name: 'Tailwind CSS', level: 92, color: '#38BDF8' },
    { name: 'Contentful / Sanity CMS', level: 85, color: '#F1564C' },
  ];

  const projects = [
    {
      title: 'Headless E-commerce Storefront',
      tech: ['Next.js', 'Contentful', 'TypeScript', 'Tailwind'],
      desc: 'Full headless commerce architecture with dynamic CMS-driven pages, optimized conversion funnel, and SSR for SEO.',
      tag: 'E-commerce',
      href: 'https://github.com/lucasfernandezdev15',
    },
    {
      title: 'Component Library — 40+ components',
      tech: ['React', 'Storybook', 'Material UI', 'TypeScript'],
      desc: 'Production-grade UI library with full TypeScript coverage, accessibility standards, and visual regression tests.',
      tag: 'Design System',
      href: 'https://github.com/lucasfernandezdev15',
    },
    {
      title: 'AI-Powered PR Review Bot',
      tech: ['Node.js', 'Claude API', 'GitHub Actions'],
      desc: 'GitHub Action that uses Claude to review PRs automatically — catches logic issues and enforces team conventions.',
      tag: 'AI Tooling',
      href: 'https://github.com/lucasfernandezdev15',
    },
    {
      title: 'CMS Migration Pipeline',
      tech: ['Python', 'Sanity', 'Contentful', 'Node.js'],
      desc: 'Automated pipeline migrating 10k+ content entries between CMS platforms with zero downtime and rollback support.',
      tag: 'Backend',
      href: 'https://github.com/lucasfernandezdev15',
    },
  ];

  return (
    <div className="app">
      <div className="noise" aria-hidden />
      <MagneticCursor />

      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <span className="nav-logo">LF<span className="nav-dot">.</span></span>
        <div className="nav-links">
          {['Work','Skills','About','Contact'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-grid" aria-hidden />
        <div className="hero-content">
          <Reveal><p className="eyebrow">Available for remote work</p></Reveal>
          <Reveal delay={100}>
            <h1 className="hero-name">
              <GlitchText text="Lucas" /> <span className="name-light">Fernandez</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="hero-role">
              <Typewriter strings={['Senior Frontend Engineer','AI-Augmented Developer','Next.js Specialist','E-commerce Builder']} />
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="hero-sub">12+ years shipping production React apps. I use AI tools daily to move faster and build better.</p>
          </Reveal>
          <Reveal delay={400}>
            <div className="hero-ctas">
              <a href="#work" className="btn-primary">See my work</a>
              <a href="mailto:lucaspho@gmail.com" className="btn-ghost">Get in touch</a>
            </div>
          </Reveal>
        </div>
        <div className="scroll-hint" aria-hidden><span>scroll</span><div className="scroll-line" /></div>
      </section>

      <section className="section" id="work">
        <Reveal><h2 className="section-label">Selected work</h2><p className="section-title">Things I've built</p></Reveal>
        <div className="projects-grid">
          {projects.map((p, i) => <ProjectCard key={p.title} {...p} delay={i * 80} />)}
        </div>
      </section>

      <section className="section section-dark" id="skills">
        <div className="skills-layout">
          <div className="skills-left">
            <Reveal>
              <h2 className="section-label">Expertise</h2>
              <p className="section-title">Core skills</p>
              <p className="skills-sub">Deep frontend knowledge paired with AI tooling. Not just code generation — real workflow integration that ships faster.</p>
            </Reveal>
          </div>
          <div className="skills-right">
            {skills.map((s, i) => <SkillBar key={s.name} {...s} delay={i * 100} />)}
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="about-layout">
          <Reveal className="about-left">
            <h2 className="section-label">About</h2>
            <p className="section-title">Who I am</p>
          </Reveal>
          <Reveal delay={120} className="about-right">
            <p className="about-text">Based in Tandil, Argentina. 12+ years building web products for companies across LATAM and remotely for US/EU clients.</p>
            <p className="about-text">I specialize in React/Next.js ecosystems, headless CMS architectures, and e-commerce frontends. Since 2023 I've been integrating AI tools into my daily workflow — Claude, Cursor, Copilot — which has meaningfully changed how fast I ship.</p>
            <p className="about-text">I care about conversion funnels, UX details, and why some checkout flows work and others don't.</p>
            <div className="about-tags">
              {['Remote-first','English fluent','UTC-3','12+ yrs XP','Open to full-time'].map(t => (
                <span key={t} className="about-tag">{t}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-dark section-contact" id="contact">
        <Reveal>
          <p className="section-label">Let's talk</p>
          <h2 className="contact-title">Open to opportunities</h2>
          <p className="contact-sub">Remote · Full-time or contract · React / Next.js / Node</p>
          <a href="mailto:lucaspho@gmail.com" className="btn-primary btn-large">lucaspho@gmail.com</a>
          <div className="social-links">
            <a href="https://github.com/lucasfernandezdev15" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/ACoAAA9wvEYBfgEa1wdwofAAGAnMTu-hNSD8mQk" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </Reveal>
      </section>

      <footer className="footer">
        <span>Lucas Fernandez © 2025</span>
        <span className="footer-right">Built with React + AI</span>
      </footer>
    </div>
  );
}
