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
    const onOver = (e) => {
      if (e.target.closest('a, button, .tilt-card, .terminal-window, .stat-cell')) setHovered(true);
    };
    const onOut = (e) => {
      if (!e.relatedTarget?.closest('a, button, .tilt-card, .terminal-window, .stat-cell')) setHovered(false);
    };
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${pos.current.x}px,${pos.current.y}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${target.current.x}px,${target.current.y}px)`;
      raf.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className={`cursor-ring ${hovered ? 'cursor-hover' : ''}`} />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const max = scrollHeight - clientHeight;
      setProgress(max > 0 ? (scrollTop / max) * 100 : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden />;
}

function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = 0;
    let h = 0;

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: (Math.random() - 0.5) * 0.00025,
      a: Math.random() * 0.45 + 0.15,
    }));

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(232,213,176,${(1 - dist / 120) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,213,176,${p.a})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-particles" aria-hidden />;
}

function HeroSpotlight() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return <div ref={ref} className="hero-spotlight" aria-hidden />;
}

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
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

function ScrambleTitle({ text, className = '' }) {
  const [ref, visible] = useReveal(0.3);
  const [display, setDisplay] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  useEffect(() => {
    if (!visible) return;
    let frame = 0;
    const total = 18;
    const id = setInterval(() => {
      frame += 1;
      if (frame >= total) { setDisplay(text); clearInterval(id); return; }
      setDisplay(text.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (i < (frame / total) * text.length) return c;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
    }, 40);
    return () => clearInterval(id);
  }, [visible, text]);
  return <p ref={ref} className={`section-title scramble-title ${className}`}>{display}</p>;
}

const TERMINAL_LINES = [
  { prompt: '$', cmd: 'whoami', out: 'lucas-fernandez · fullstack-engineer · AR' },
  { prompt: '$', cmd: 'cat stack.json', out: '{ react, next, node, python, ai-tools }' },
  { prompt: '$', cmd: 'curl leadpages-preview.vercel.app', out: '200 OK · Rack & Pinion · Sanity CMS' },
  { prompt: '$', cmd: 'cursor --status', out: '● AI-augmented workflow · Claude · Copilot' },
];

function HeroTerminal() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('cmd');

  useEffect(() => {
    const line = TERMINAL_LINES[step % TERMINAL_LINES.length];
    let t;
    if (phase === 'cmd') {
      if (typed.length < line.cmd.length) {
        t = setTimeout(() => setTyped(line.cmd.slice(0, typed.length + 1)), 42);
      } else {
        t = setTimeout(() => setPhase('out'), 400);
      }
    } else if (phase === 'out') {
      t = setTimeout(() => {
        setStep(s => s + 1);
        setTyped('');
        setPhase('cmd');
      }, 2200);
    }
    return () => clearTimeout(t);
  }, [typed, phase, step]);

  const current = TERMINAL_LINES[step % TERMINAL_LINES.length];
  const history = TERMINAL_LINES.slice(0, step % TERMINAL_LINES.length);

  return (
    <div className="terminal-window">
      <div className="terminal-chrome">
        <span className="terminal-dot terminal-dot-r" />
        <span className="terminal-dot terminal-dot-y" />
        <span className="terminal-dot terminal-dot-g" />
        <span className="terminal-title">lucas@portfolio ~ zsh</span>
      </div>
      <div className="terminal-body">
        {history.map((l, i) => (
          <div key={i} className="terminal-line">
            <span className="terminal-prompt">{l.prompt}</span> {l.cmd}
            <div className="terminal-out">{l.out}</div>
          </div>
        ))}
        <div className="terminal-line terminal-active">
          <span className="terminal-prompt">{current.prompt}</span> {typed}
          <span className="terminal-caret">▊</span>
        </div>
        {phase === 'out' && <div className="terminal-out terminal-out-in">{current.out}</div>}
      </div>
    </div>
  );
}

function Marquee({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-wrap" aria-hidden>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee-item">
            <span className="marquee-dot" />{item}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatCell({ value, suffix = '', label, delay = 0 }) {
  const [ref, visible] = useReveal();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const num = parseInt(value, 10);
    let start = 0;
    const dur = 1200;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      start = Math.round(num * eased);
      setCount(start);
      if (p < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), delay);
    return () => clearTimeout(t);
  }, [visible, value, delay]);
  return (
    <div ref={ref} className="stat-cell">
      <span className="stat-value">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function TiltCard({ children, className = '', featured = false }) {
  const cardRef = useRef(null);
  const handleMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * (featured ? 10 : 16);
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -(featured ? 10 : 16);
    card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) scale(${featured ? 1.01 : 1.025})`;
  }, [featured]);
  const handleLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);
  return (
    <div ref={cardRef} className={`tilt-card ${featured ? 'tilt-card-featured' : ''} ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
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

function ProjectCard({ title, tech, desc, tag, demoUrl, githubUrl, metric, delay, featured = false, index = 0 }) {
  return (
    <Reveal delay={delay} className={`bento-item bento-item-${index}${featured ? ' bento-featured' : ''}`}>
      <TiltCard featured={featured}>
        <div className="proj-index">{String(index + 1).padStart(2, '0')}</div>
        <div className="proj-tag">{tag}</div>
        <h3 className="proj-title">{title}</h3>
        {metric && (
          <div className="proj-metric">
            <span className="proj-metric-value">{metric.value}</span>
            <span className="proj-metric-label">{metric.label}</span>
          </div>
        )}
        <p className="proj-desc">{desc}</p>
        <div className="proj-tech">
          {tech.map(t => <span key={t} className="tech-badge">{t}</span>)}
        </div>
        <div className="proj-links">
          {demoUrl && <a href={demoUrl} target="_blank" rel="noreferrer" className="proj-link proj-link-live">Live demo →</a>}
          {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="proj-link">GitHub →</a>}
        </div>
      </TiltCard>
    </Reveal>
  );
}

function ExperienceItem({ role, company, period, location, bullets, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <article className="exp-item">
        <div className="exp-header">
          <h3 className="exp-role">{role}</h3>
          <span className="exp-period">{period}</span>
        </div>
        <p className="exp-company">{company} · {location}</p>
        <ul className="exp-bullets">
          {bullets.map(b => <li key={b}>{b}</li>)}
        </ul>
      </article>
    </Reveal>
  );
}

export default function App() {
  const cvHref = `${process.env.PUBLIC_URL}/Lucas_Fernandez_CV.pdf`;
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const skills = [
    { name: 'React / Next.js', level: 95, color: '#61DAFB' },
    { name: 'TypeScript / Node.js', level: 90, color: '#3178C6' },
    { name: 'Python / APIs', level: 82, color: '#8CC84B' },
    { name: 'AI Tooling — Claude · Copilot · Cursor', level: 88, color: '#F5A623' },
    { name: 'Sanity CMS / Headless', level: 88, color: '#F1564C' },
    { name: 'Vercel / CI · Docker', level: 85, color: '#F1564C' },
  ];

  const projects = [
    {
      title: 'Leadpages — Rack & Pinion',
      tech: ['Next.js', 'Sanity CMS', 'TypeScript', 'Turborepo', 'Tailwind'],
      desc: 'Marketing site for Leadpages, the landing-page platform used by 466k+ businesses to capture leads. Classic Rack & Pinion build — the editorial site before the current AI-first redesign: homepage, blog, templates, and conversion sections powered by Sanity, not the new AI page builder flow.',
      tag: 'Enterprise · MarTech',
      demoUrl: 'https://leadpages-rack-pinion-git-fix-home-s-7c8fe2-leadpages-marketing.vercel.app/',
      githubUrl: 'https://github.com/lucasfernandezdev15/leadpages',
      featured: true,
      metric: { value: 'Monorepo', label: 'Next.js + Sanity Studio · Turborepo · Radix · Motion · Vercel' },
    },
    {
      title: 'AI UX Lab',
      tech: ['Next.js 15', 'TypeScript', 'SSE', 'Gemini · OpenAI'],
      desc: 'UX lab for LLM apps: SSE streaming, markdown, tool calling, memory panel, and multi-session chat. Built to show in interviews how you design product UX with LLMs — not just API wrappers. Runs in demo mode without an API key.',
      tag: 'AI · Frontend UX',
      demoUrl: 'https://ai-aux-lab.vercel.app/',
      githubUrl: 'https://github.com/lucasfernandezdev15',
      metric: { value: '7+ patterns', label: 'SSE streaming · tools UI · memory · multi-provider chat' },
    },
    {
      title: 'DevProbe — Live Coding Tests',
      tech: ['Next.js', 'TypeScript', 'Claude API', 'React Query'],
      desc: 'Practice platform for senior frontend interviews. AI reads your code on an interval and gives real-time advice — like a live interviewer watching your screen.',
      tag: 'AI Tooling',
      demoUrl: 'https://live-coding-test-alpha.vercel.app/',
      githubUrl: 'https://github.com/lucasfernandezdev15',
      metric: { value: '28+ challenges', label: 'AI reviewer polls your code every ~30s during sessions' },
    },
    {
      title: 'FieldAnalyst — Hockey Analytics',
      tech: ['React', 'Video API', 'Canvas', 'Zustand'],
      desc: 'Sports video editor inspired by LongoMatch plus a tactical board for field hockey. Tag events on the timeline, draw formations, analyze set pieces.',
      tag: 'Sports Tech',
      demoUrl: 'https://fieldhockey-analyst.vercel.app/',
      githubUrl: 'https://github.com/lucasfernandezdev15',
      metric: { value: '2-in-1', label: 'frame-accurate video tagging + tactical pizarra in one app' },
    },
    {
      title: 'Filuca — Artisan Fashion',
      tech: ['React', 'CSS', 'Vercel', 'WhatsApp API'],
      desc: 'Editorial storefront for a handmade knitwear brand in Buenos Aires. Limited-edition catalog, collection filters, direct WhatsApp checkout.',
      tag: 'E-commerce',
      demoUrl: 'https://filuca.vercel.app/',
      metric: { value: 'LCP 1.8s', label: 'mobile · static deploy, zero backend overhead' },
    },
  ];

  const marqueeItems = [
    'React 19', 'Next.js 15', 'Sanity CMS', 'SSE Streaming', 'TypeScript',
    'Gemini API', 'Turborepo', 'Claude API', 'Vercel', 'Fullstack',
  ];

  const experience = [
    {
      role: 'Senior Fullstack Developer',
      company: 'Código del Sur',
      period: 'May 2022 – Present',
      location: 'Remote',
      bullets: [
        'Built 40+ reusable React/Next.js components, cutting new-feature UI dev time ~35%.',
        'Integrated AI-assisted workflow (Copilot + Claude) — faster sprints and shorter PR cycles.',
        'Architected headless Contentful & Sanity integrations for 3 enterprise storefront clients.',
        'Collaborated with UX on conversion funnels; measurable lift in checkout completion.',
      ],
    },
    {
      role: 'Fullstack Developer',
      company: 'Natural Tech House',
      period: 'Jan 2020 – May 2022',
      location: 'Remote',
      bullets: [
        'React, TypeScript, and Material UI apps with Python backend integrations.',
        'Contentful CMS workflows for content-driven e-commerce across multiple clients.',
        'Responsive standards that cut QA-reported layout bugs by 40%.',
      ],
    },
    {
      role: 'Semi-Senior Fullstack Developer',
      company: '7 Ideas · Grupo Most',
      period: 'Jan 2014 – Jan 2020',
      location: 'Remote / Hybrid',
      bullets: [
        'Led frontend migration from AngularJS to React; full-stack REST API work.',
        'Earlier: Java/Spring/Hibernate backend and mobile apps (Grupo Most, 2014–2017).',
      ],
    },
  ];

  return (
    <div className="app">
      <ScrollProgress />
      <div className="noise" aria-hidden />
      <MagneticCursor />

      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <span className="nav-logo">LF<span className="nav-dot">.</span></span>
        <div className="nav-links">
          {['Work','Experience','Skills','About','Contact'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
          <a href={cvHref} download="Lucas_Fernandez_CV.pdf" className="nav-link nav-link-cv">CV ↓</a>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-aurora" aria-hidden />
        <HeroParticles />
        <div className="hero-waves" aria-hidden>
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path className="wave wave-1" d="M0,160 C360,80 720,240 1080,160 C1260,120 1380,180 1440,160 L1440,320 L0,320 Z" />
            <path className="wave wave-2" d="M0,200 C360,120 720,280 1080,200 C1260,160 1380,220 1440,200 L1440,320 L0,320 Z" />
          </svg>
        </div>
        <HeroSpotlight />
        <div className="hero-grid" aria-hidden />
        <div className="hero-layout">
          <div className="hero-content">
            <Reveal><p className="eyebrow">Available for remote work</p></Reveal>
            <Reveal delay={100}>
              <div className="hero-name-wrap">
                <div className="hero-name-glow" aria-hidden />
                <h1 className="hero-name">
                  <GlitchText text="Lucas" /> <span className="name-light">Fernandez</span>
                </h1>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <p className="hero-role">
                <Typewriter strings={['Fullstack Engineer','AI-Augmented Developer','React · Node · Python','Builder of DevProbe & FieldAnalyst']} />
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="hero-sub">12+ years shipping production web apps — frontend, backend, and everything in between. I use AI tools daily to move faster and build better.</p>
            </Reveal>
            <Reveal delay={400}>
              <div className="hero-ctas">
                <a href="#work" className="btn-primary btn-glow">See my work</a>
                <a href={cvHref} download="Lucas_Fernandez_CV.pdf" className="btn-ghost">Download CV</a>
                <a href="mailto:lucaspho@gmail.com" className="btn-ghost">Get in touch</a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={250} className="hero-terminal-wrap">
            <HeroTerminal />
          </Reveal>
        </div>
        <div className="scroll-hint" aria-hidden><span>scroll</span><div className="scroll-line" /></div>
      </section>

      <Marquee items={marqueeItems} />

      <section className="stats-strip" aria-label="Key metrics">
        <StatCell value="12" suffix="+" label="Years shipping" delay={0} />
        <StatCell value="40" suffix="+" label="UI components built" delay={80} />
        <StatCell value="5" suffix="" label="Live demos deployed" delay={160} />
        <StatCell value="28" suffix="+" label="Coding challenges in DevProbe" delay={240} />
      </section>

      <section className="section" id="work">
        <Reveal><h2 className="section-label">Selected work</h2></Reveal>
        <ScrambleTitle text="Things I've built" />
        <div className="projects-bento">
          {projects.map((p, i) => <ProjectCard key={p.title} {...p} index={i} delay={i * 80} />)}
        </div>
      </section>

      <section className="section section-dark" id="experience">
        <div className="experience-layout">
          <Reveal className="experience-left">
            <h2 className="section-label">Career</h2>
            <ScrambleTitle text="Experience" className="section-title-inline" />
            <p className="experience-sub">12+ years from AngularJS migrations to AI-augmented fullstack delivery. Full timeline in the PDF.</p>
            <a href={cvHref} download="Lucas_Fernandez_CV.pdf" className="btn-primary btn-glow experience-cv-btn">Download CV (PDF)</a>
            <p className="experience-edu">Systems Analyst · UNICEN, Tandil · 2005 – 2013</p>
          </Reveal>
          <div className="experience-list">
            {experience.map((job, i) => (
              <ExperienceItem key={job.company} {...job} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark" id="skills">
        <div className="skills-layout">
          <div className="skills-left">
            <Reveal>
              <h2 className="section-label">Expertise</h2>
              <ScrambleTitle text="Core skills" className="section-title-inline" />
              <p className="skills-sub">Fullstack delivery — React/Next.js frontends, Node/Python backends, and AI tooling wired into real workflows. Not just code generation — shipping faster with intent.</p>
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
            <div className="about-avatar-wrap">
              <img
                src={`${process.env.PUBLIC_URL}/avatar.png`}
                alt="Lucas Fernandez — Fullstack Engineer"
                className="about-avatar"
                width={280}
                height={280}
                loading="lazy"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `${process.env.PUBLIC_URL}/avatar.svg`; }}
              />
            </div>
            <h2 className="section-label">About</h2>
            <ScrambleTitle text="Who I am" className="section-title-inline" />
          </Reveal>
          <Reveal delay={120} className="about-right">
            <p className="about-text">Based in Tandil, Argentina. 12+ years building web products for companies across LATAM and remotely for US/EU clients.</p>
            <p className="about-text">I'm a fullstack engineer — React/Next.js on the front, Node and Python on the back, with AI tools integrated into how I actually work. From Leadpages' Sanity-driven marketing stack to DevProbe, FieldAnalyst and Filuca — all shipped and deployed.</p>
            <p className="about-text">I care about shipping real products: performance metrics, conversion funnels, and why some architectures survive production and others don't.</p>
            <div className="about-tags">
              {['Fullstack','Remote-first','English fluent','UTC-3','12+ yrs XP','Open to full-time'].map(t => (
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
          <p className="contact-sub">Remote · Full-time or contract · React / Node / Python</p>
          <a href="mailto:lucaspho@gmail.com" className="btn-primary btn-large btn-glow">lucaspho@gmail.com</a>
          <a href={cvHref} download="Lucas_Fernandez_CV.pdf" className="btn-ghost btn-large contact-cv-btn">Download CV</a>
          <div className="social-links">
            <a href="https://github.com/lucasfernandezdev15" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/lucas-fernandez-19a90772" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </Reveal>
      </section>

      <footer className="footer">
        <span>Lucas Fernandez © 2026</span>
        <span className="footer-right">Built with React + AI</span>
      </footer>
    </div>
  );
}
