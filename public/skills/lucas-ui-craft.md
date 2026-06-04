---
name: lucas-ui-craft
description: Build distinctive React/Next.js UIs without AI slop. Use when designing portfolios, SaaS landings, e-commerce, or dev-tool marketing pages. Applies Lucas Fernandez's shipped patterns from Leadpages, DevProbe, AI UX Lab, and lucasfernandezdev15/portfolio — bento layouts, cinematic heroes, case-study metrics, mobile-safe grids.
license: Complete terms in LICENSE.txt
---

# Lucas UI Craft

Personal frontend skill by **Lucas Fernandez** (12+ yrs fullstack, Tandil AR).  
Forked from Anthropic's `frontend-design`, rewritten around **things I actually shipped** — not abstract taste.

Use this when the user wants a landing page, portfolio, dashboard shell, or React component that must look **hired**, not **generated**.

---

## Step 0 — Pick a lane (commit to ONE)

| Lane | Shipped example | When to use |
|---|---|---|
| **Cinematic dev** | [DevProbe](https://live-coding-test-alpha.vercel.app/), [AI UX Lab](https://ai-aux-lab.vercel.app/) | AI tools, dark hero, mono accents, SSE/chat |
| **Enterprise editorial** | [Leadpages Rack & Pinion](https://leadpages-rack-pinion-git-fix-home-s-7c8fe2-leadpages-marketing.vercel.app/) | Sanity CMS, conversion sections, trust metrics |
| **Editorial commerce** | [Filuca](https://filuca.vercel.app/) | Small brand, WhatsApp CTA, LCP-first static |
| **Portfolio bento** | [lucasfernandezdev15/portfolio](https://github.com/lucasfernandezdev15/portfolio) | Hiring page, project proof, CV download |

Do **not** blend lanes in one page. Terminal mono body + cinematic hero is intentional (Ollama × ElevenLabs remix); purple SaaS gradient is not.

---

## Step 1 — Layout rules (non-negotiable)

1. **No 3-column hero feature grid** — use bento (featured 2×2), marquee strip, or alternating rows ([awesome-claude-design anti-slop](https://github.com/rohitg00/awesome-claude-design)).
2. **Every project card needs a metric** — e.g. `LCP 1.8s`, `28+ challenges`, `10k+ CMS entries`, `Monorepo · Sanity`.
3. **Mobile ≤1024px:** single column; kill `min-height: 100%` on grid children (causes empty ghost space).
4. **Typography:** Syne + DM Mono + DM Sans works for dark editorial; don't default to Inter/Space Grotesk unless brand requires it.
5. **One hero moment** — aurora + particles OR terminal OR spotlight; not all three competing.

---

## Step 2 — Motion & depth

- Scroll progress bar (2px gradient) — cheap, reads premium.
- IntersectionObserver reveals with stagger (`transition-delay`), disconnect after first fire.
- Custom cursor only desktop; `cursor: auto` on mobile.
- Particles/waves ≤8% opacity — motion supports, never dominates.

---

## Step 3 — Before merge (anti-slop gate)

Run from repo root:

```bash
node scripts/anti-slop-scan.js ./src
node scripts/anti-slop-scan.js ./src --json   # CI-friendly
```

Checklist:
- [ ] Live demo link on ≥1 project (not all GitHub-only)
- [ ] Open Graph tags if page is shareable (LinkedIn/X)
- [ ] Experience section: title full-width, jobs in second column (no overlap)
- [ ] Avatar or human photo in About if portfolio

---

## Case studies (copy patterns, not pixels)

### Portfolio bento (my site)
- Leadpages featured 2×2; AI UX Lab + DevProbe + FieldAnalyst + Filuca with live URLs.
- OSS section previews `SKILL.md` inline — recruiters read the agent instructions.

### AI UX Lab
- SSE streaming chat, tool-calling UI, multi-session sidebar — patterns hiring teams grep for in 2026.

### Leadpages
- Next.js + Sanity + Turborepo monorepo; classic Rack & Pinion (pre-AI marketing site).

---

## When NOT to use maximal effects

Filuca-style commerce: static, fast, editorial photography — **no** particle canvas. Match complexity to business goal.

---

## Install (Cursor)

```bash
git clone https://github.com/lucasfernandezdev15/ai-skill-frontend-design.git
cp -r ai-skill-frontend-design ~/.cursor/skills/lucas-ui-craft
```

Invoke with `@lucas-ui-craft` — Cursor auto-invoke is unreliable; mention the skill in prompt for critical UI work.

---

## Upstream

Based on [anthropics/skills/frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design). Generic Anthropic guidelines trimmed in favor of shipped examples above.
