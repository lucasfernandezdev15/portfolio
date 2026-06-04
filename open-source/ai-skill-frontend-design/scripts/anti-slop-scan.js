#!/usr/bin/env node
/** Lucas UI Craft — anti-slop scanner for React/CSS codebases */
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || '.';
const jsonOut = process.argv.includes('--json');
const RULES = [
  { id: 'inter-font', re: /font-family:\s*['"]?Inter/gi, msg: 'Inter font — use a distinctive pair (see lucas-ui-craft SKILL)' },
  { id: 'space-grotesk', re: /Space Grotesk/gi, msg: 'Space Grotesk — overused in AI landings' },
  { id: 'grid-3col', re: /grid-template-columns:\s*repeat\(3/gi, msg: '3-column grid — prefer bento or marquee' },
  { id: 'purple-gradient', re: /purple.*gradient|gradient.*purple|#a259ff|#8b5cf6/gi, msg: 'Purple gradient trope' },
  { id: 'min-height-100', re: /min-height:\s*100%/gi, msg: 'min-height 100% — causes mobile ghost gaps in bento grids' },
  { id: 'generic-hero', re: /features\.map|feature-grid|three-column/i, msg: 'Possible generic hero-features pattern' },
  { id: 'missing-metric', re: /proj-desc(?!.*\d)/gi, msg: 'Project cards: consider a metric (LCP, %, count) in copy' },
];

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.') || ent.name === 'node_modules' || ent.name === 'build') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(css|jsx|tsx|js|html)$/i.test(ent.name)) acc.push(p);
  }
  return acc;
}

const findings = [];
for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    if (rule.re.test(text)) findings.push({ file, id: rule.id, msg: rule.msg });
  }
}

if (jsonOut) {
  console.log(JSON.stringify({ root: ROOT, count: findings.length, findings }, null, 2));
} else {
  findings.forEach(f => console.log(`${f.file}\n  ⚠ [${f.id}] ${f.msg}\n`));
  console.log(findings.length
    ? `\n${findings.length} warning(s). See lucas-ui-craft SKILL for fixes.`
    : '✓ No slop fingerprints detected.');
}
process.exit(findings.length ? 1 : 0);
