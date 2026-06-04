#!/usr/bin/env node
/** Quick heuristic scan for generic AI landing page fingerprints */
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || '.';
const RULES = [
  { re: /font-family:\s*['"]?Inter/gi, msg: 'Inter font — consider a distinctive display/body pair' },
  { re: /grid-template-columns:\s*repeat\(3/gi, msg: '3-column grid — try bento or asymmetric layout' },
  { re: /purple.*gradient|gradient.*purple/gi, msg: 'Purple gradient trope detected' },
  { re: /hero.*features.*grid/gi, msg: 'Generic hero-features-grid pattern' },
  { re: /min-height:\s*100%/gi, msg: 'min-height 100% — check mobile empty gaps' },
];

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.') || ent.name === 'node_modules') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(css|jsx|tsx|js|html)$/i.test(ent.name)) acc.push(p);
  }
  return acc;
}

let hits = 0;
for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const { re, msg } of RULES) {
    if (re.test(text)) {
      console.log(`${file}\n  ⚠ ${msg}\n`);
      hits += 1;
      re.lastIndex = 0;
    }
  }
}
console.log(hits ? `Found ${hits} warning(s).` : 'No slop fingerprints detected.');
process.exit(hits ? 1 : 0);
