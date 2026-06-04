---
name: lucas-mcp-ship
description: Ship MCP servers and AI tool UIs to production. Use when building Model Context Protocol tools, Cursor integrations, SSE streaming panels, or Vercel-hosted agent backends. Combines Anthropic mcp-builder rigor with Lucas Fernandez patterns from DevProbe and AI UX Lab.
license: Complete terms in LICENSE.txt
---

# Lucas MCP Ship

Personal MCP skill by **Lucas Fernandez** — fullstack engineer who ships **DevProbe** (AI live-coding reviewer) and **AI UX Lab** (multi-provider SSE chat).

Fork of Anthropic's `mcp-builder`, condensed to what I use when an agent must **touch real APIs** without blowing context or leaking secrets.

---

## When to use this skill

- New MCP server (TypeScript preferred, Python OK)
- Remote MCP on Vercel (Streamable HTTP, stateless JSON)
- Tool design review before PR
- Pairing MCP backend with a React panel (DevProbe / AI UX Lab pattern)

---

## Lucas shipping stack

| Layer | Choice | Why |
|---|---|---|
| Transport | Streamable HTTP (remote) / stdio (local) | Scales on Vercel; simple ops |
| Language | TypeScript + Zod | Agents generate TS well; schemas = tool contracts |
| Hosting | Vercel Edge or Node route | Same deploy path as my Next apps |
| Client | Cursor + optional custom UI | Document `@lucas-mcp-ship`; don't rely on auto-invoke |

---

## Tool design (learned from DevProbe)

1. **Prefix everything:** `devprobe_submit_code`, `devprobe_get_hint` — not `submit`.
2. **Paginate lists** — agents dump 200 items into context and hallucinate.
3. **Errors are prompts:** `"GitHub API 403: missing repo scope. Add 'repo' to PAT and retry."`
4. **Annotations:** `readOnlyHint`, `destructiveHint`, `idempotentHint` — set explicitly.
5. **Health tool:** `mcp_ping` → `{ version, uptime_ms }` for deploy smoke tests.
6. **Polling vs streaming:** DevProbe polls code on interval; AI UX Lab uses SSE tokens — pick one model per product, don't mix UX.

---

## Pre-ship checklist

```bash
npm run build
npx @modelcontextprotocol/inspector
node scripts/tool-lint.mjs src/index.ts
```

- [ ] No hardcoded API keys (use `process.env`)
- [ ] Timeouts on every external fetch
- [ ] Rate limit or debounce on expensive tools
- [ ] 10 eval questions in XML ([evaluation guide](./reference/evaluation.md))
- [ ] README with env vars table

---

## Vercel deploy notes (my default)

1. Route Handler or Edge function exposes `/mcp` POST.
2. Env: `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, etc. — never commit.
3. CORS only if browser client; Cursor uses server-side.
4. Log tool name + duration; redact PII.

---

## Case study: DevProbe

- AI reads candidate code every ~30s during live coding sessions.
- Not a chat wrapper — **timed reviewer loop** with structured feedback.
- Lesson: agents need **narrow tools** (read file, diff, lint) not one mega `analyze_everything`.

## Case study: AI UX Lab

- SSE streaming + markdown + tool timeline UI.
- Multi-provider (Gemini, OpenAI, Anthropic) with demo mode (no key).
- Lesson: **UI state machine** for `pending → running → done` on tool calls.

---

## Full MCP workflow (Anthropic reference)

For deep protocol work, read in order:
1. [MCP best practices](./reference/mcp_best_practices.md)
2. [TypeScript guide](./reference/node_mcp_server.md) or [Python guide](./reference/python_mcp_server.md)
3. [Evaluation guide](./reference/evaluation.md)

---

## Install (Cursor)

```bash
git clone https://github.com/lucasfernandezdev15/ai-skill-mcp-builder.git
cp -r ai-skill-mcp-builder ~/.cursor/skills/lucas-mcp-ship
```

---

## Upstream

Based on [anthropics/skills/mcp-builder](https://github.com/anthropics/skills/tree/main/skills/mcp-builder). Reference docs and evaluation scripts preserved.
