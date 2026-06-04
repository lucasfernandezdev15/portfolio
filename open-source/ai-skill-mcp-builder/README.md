# mcp-builder ✨ (enhanced fork)

Enhanced fork of Anthropic's [`mcp-builder`](https://github.com/anthropics/skills/tree/main/skills/mcp-builder) skill.

**Added by Lucas Fernandez:**
- AI-native product checklist (annotations, pagination, Cursor quirks)
- Vercel remote MCP deploy notes
- `scripts/tool-lint.mjs` — quick tool metadata hygiene scan

## Install (Cursor)

```bash
git clone https://github.com/lucasfernandezdev15/ai-skill-mcp-builder.git
cp -r ai-skill-mcp-builder ~/.cursor/skills/mcp-builder
```

## Lint your server

```bash
node scripts/tool-lint.mjs src/index.ts
```

Includes upstream `reference/` docs and evaluation scripts from Anthropic.

## License

Anthropic skill terms in `LICENSE.txt`. Enhancements MIT.
