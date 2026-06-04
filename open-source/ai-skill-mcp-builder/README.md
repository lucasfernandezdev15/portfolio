# lucas-mcp-ship

Personal Cursor skill by **Lucas Fernandez** — ship MCP servers + AI tool UIs (DevProbe, AI UX Lab patterns).

Fork of Anthropic `mcp-builder` with production checklists and case studies.

## Install

```bash
git clone https://github.com/lucasfernandezdev15/ai-skill-mcp-builder.git
cp -r ai-skill-mcp-builder ~/.cursor/skills/lucas-mcp-ship
```

## Lint

```bash
node scripts/tool-lint.mjs src/index.ts
node scripts/tool-lint.mjs src/index.ts --json
npx @modelcontextprotocol/inspector
```

## Reference docs

See `reference/` for full Anthropic MCP guides.
