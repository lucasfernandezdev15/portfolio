---
name: live-coding-reviewer
description: Design and build AI-powered live coding interview platforms. Use when implementing timed code review, SSE hint streams, challenge banks, or interviewer-style feedback loops. Original skill by Lucas Fernandez from shipping DevProbe (live-coding-test-alpha.vercel.app).
---

# Live Coding Reviewer

**Original skill — Lucas Fernandez**  
Built from [DevProbe](https://live-coding-test-alpha.vercel.app/) — 28+ frontend challenges with an AI that watches your code on a timer and responds like a senior interviewer.

No Anthropic upstream. Use when the product is **practice interviews**, not generic chat.

---

## Core loop (DevProbe architecture)

```
User edits code in browser
        ↓ (every N seconds, e.g. 30s)
Backend snapshots workspace
        ↓
LLM prompt: role=interviewer, context=challenge rubric + current code
        ↓
Structured feedback → UI panel (hints, not full solutions)
```

**Rules:**
- Never auto-submit solutions — nudge toward discovery.
- Feedback must reference **specific lines or patterns** in current code.
- Separate **challenge definition** (static) from **review prompt** (dynamic).

---

## Challenge bank design

Each challenge needs:
| Field | Example |
|---|---|
| `id` | `use-reducer-counter` |
| `difficulty` | easy / medium / hard |
| `stack` | React, TypeScript, Jest |
| `rubric` | Must use discriminated union actions; no `any` |
| `timebox_min` | 15 |
| `trap` | Double-submit on rapid clicks |

DevProbe categories: JS utilities, UI coding, Testing, Next.js, Auth — filterable in UI.

---

## AI reviewer prompt shape

```
You are a senior frontend interviewer. The candidate is solving: {title}.
Rubric: {rubric}
Time elapsed: {minutes}m

Current code:
```
{code}
```

Respond in ≤120 words:
1. One thing done well
2. One concrete issue (file/line if possible)
3. One hint question — do NOT give the full answer
```

Rotate tone: supportive on easy, Socratic on hard.

---

## UI patterns that matter

- **Split pane:** editor + feedback drawer (not modal — user must see both).
- **Timer visible** — pressure is part of the product.
- **Stack tags** on cards — recruiters scan filters first.
- **Rick & Morty / external challenge** link optional — shows extensibility.

---

## Tech stack (what I used)

- Next.js App Router
- TypeScript strict
- React Query for challenge list
- Zustand for session state
- Claude API (or swappable provider)
- Vercel deploy

SSE optional for **streaming hints**; polling OK for MVP (DevProbe uses interval review).

---

## Anti-patterns

- ❌ ChatGPT clone with "evaluate my code" button once at end
- ❌ AI dumps complete refactored solution
- ❌ No rubric → generic "looks good" feedback
- ❌ Single monolithic `review()` tool with 50kb context

---

## Extend to your product

- Add **language switcher** (JS vs TS challenges)
- **Session replay** — store snapshots for hiring manager review
- **Plagiarism guard** — compare against known solutions corpus

---

## Install (Cursor)

```bash
# In portfolio monorepo:
cp -r open-source/ai-skill-live-coding-reviewer ~/.cursor/skills/live-coding-reviewer
```

Or clone [lucasfernandezdev15/portfolio](https://github.com/lucasfernandezdev15/portfolio) and copy from `open-source/ai-skill-live-coding-reviewer`.

Invoke: `@live-coding-reviewer`

---

## Author

Lucas Fernandez · [DevProbe live](https://live-coding-test-alpha.vercel.app/) · [GitHub](https://github.com/lucasfernandezdev15)
