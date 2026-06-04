#!/usr/bin/env node
/** Lightweight MCP tool definition linter — scans for common agent foot-guns */
import fs from 'fs';
import path from 'path';

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error('Usage: node scripts/tool-lint.mjs <server.ts|server.js>');
  process.exit(2);
}

const src = fs.readFileSync(file, 'utf8');
const warnings = [];

if (!/registerTool|@mcp\.tool|\.tool\(/i.test(src)) {
  warnings.push('No tool registrations found — is this the server entry?');
}
if (/password|api[_-]?key\s*=\s*['"][^'"]+['"]/i.test(src)) {
  warnings.push('Hardcoded secret detected — use env vars');
}
if (/registerTool\([^)]+\)/gs.test(src)) {
  const blocks = src.match(/registerTool\([\s\S]*?\n\s*\)/g) || [];
  for (const b of blocks) {
    if (!/description/i.test(b)) warnings.push('Tool missing description in registerTool block');
  }
}
if (!/readOnlyHint|destructiveHint/i.test(src)) {
  warnings.push('Consider adding readOnlyHint/destructiveHint annotations');
}

if (warnings.length) {
  warnings.forEach(w => console.log('⚠', w));
  process.exit(1);
}
console.log('✓ Basic MCP tool hygiene OK');
process.exit(0);
