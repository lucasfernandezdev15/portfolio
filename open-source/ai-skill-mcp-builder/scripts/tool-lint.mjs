#!/usr/bin/env node
/** Lucas MCP Ship — MCP server hygiene linter */
import fs from 'fs';

const file = process.argv[2];
const jsonOut = process.argv.includes('--json');

if (!file || !fs.existsSync(file)) {
  console.error('Usage: node scripts/tool-lint.mjs <server.ts|server.js> [--json]');
  process.exit(2);
}

const src = fs.readFileSync(file, 'utf8');
const warnings = [];

const add = (id, msg) => warnings.push({ id, msg });

if (!/registerTool|@mcp\.tool|\.tool\(|server\.tool/i.test(src)) {
  add('no-tools', 'No tool registrations found');
}
if (/password|api[_-]?key\s*=\s*['"][^'"]{8,}['"]/i.test(src)) {
  add('hardcoded-secret', 'Hardcoded secret — use process.env');
}
if (!/process\.env\./i.test(src) && /fetch\(|axios/i.test(src)) {
  add('missing-env', 'External calls without visible env config');
}
if (!/timeout|AbortSignal|signal:/i.test(src) && /fetch\(/i.test(src)) {
  add('no-timeout', 'fetch() without timeout/AbortSignal — add per lucas-mcp-ship');
}
if (!/mcp_ping|health|ping/i.test(src)) {
  add('no-health', 'Consider mcp_ping / health tool for deploy smoke tests');
}

const toolBlocks = src.match(/registerTool\([\s\S]*?\n\s*\)/gs) || [];
toolBlocks.forEach((b, i) => {
  if (!/description/i.test(b)) add(`tool-${i}-desc`, 'Tool block missing description');
  if (!/inputSchema|input_schema|z\.object/i.test(b)) add(`tool-${i}-schema`, 'Tool block missing input schema');
});

if (!/readOnlyHint|destructiveHint/i.test(src)) {
  add('no-hints', 'Missing readOnlyHint/destructiveHint annotations');
}

if (jsonOut) {
  console.log(JSON.stringify({ file, count: warnings.length, warnings }, null, 2));
} else {
  warnings.forEach(w => console.log(`⚠ [${w.id}] ${w.msg}`));
  console.log(warnings.length ? `\n${warnings.length} issue(s).` : '✓ lucas-mcp-ship hygiene OK');
}
process.exit(warnings.length ? 1 : 0);
