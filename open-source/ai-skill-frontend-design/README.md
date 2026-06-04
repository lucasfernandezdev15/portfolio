# frontend-design ✨ (enhanced fork)

Enhanced fork of Anthropic's [`frontend-design`](https://github.com/anthropics/skills/tree/main/skills/frontend-design) skill for Cursor / Claude agents.

**Added by Lucas Fernandez:**
- Anti-slop checklist (bento > 3-col grids, typography, metrics)
- DESIGN.md remix families cheat sheet
- `scripts/anti-slop-scan.js` — scan CSS/JSX for generic AI fingerprints

## Install (Cursor)

```bash
git clone https://github.com/lucasfernandezdev15/ai-skill-frontend-design.git
cp -r ai-skill-frontend-design ~/.cursor/skills/frontend-design
# or into your project's .cursor/skills/
```

## Scan your UI

```bash
node scripts/anti-slop-scan.js ./src
```

## License

Anthropic skill terms in `LICENSE.txt`. Enhancements MIT.
