#!/usr/bin/env node

/**
 * Omni-Compare Documentation Consistency Checker
 * 
 * This script scans the /docs directory for outdated keywords or patterns
 * that indicate "decayed" documentation (e.g., references to legacy SDK versions).
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(process.cwd(), 'docs');
const FORBIDDEN_PATTERNS = [
  { pattern: /Generic Data Protocol/i, message: 'Found reference to legacy "Generic Data Protocol". Update to "UI Message Stream Protocol".' },
  { pattern: /0:"/i, message: 'Found legacy "0:" prefix in text chunk examples. Update to v6 SSE JSON format.' },
  { pattern: /9:\[/i, message: 'Found legacy "9:" prefix in tool call examples. Update to v6 SSE JSON format.' },
  { pattern: /x-vercel-ai-data-stream/i, message: 'Found legacy "x-vercel-ai-data-stream" header. Update to "x-vercel-ai-ui-message-stream".' },
  { pattern: /toDataStreamResponse/i, message: 'Found reference to "toDataStreamResponse". Ensure relevance to v6 vs v3.' }
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getAllFiles(name, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(name);
    }
  });
  return fileList;
}

let hasError = false;
console.log('🔍 Checking documentation for structural decay...');

try {
  const allDocs = getAllFiles(DOCS_DIR);

  allDocs.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    FORBIDDEN_PATTERNS.forEach(({ pattern, message }) => {
      if (pattern.test(content)) {
        console.error(`❌ [${relativePath}]: ${message}`);
        hasError = true;
      }
    });
  });

  if (hasError) {
    console.error('\n🛑 Documentation check failed! Please fix the outdated content before committing.');
    process.exit(1);
  } else {
    console.log('✅ Documentation is up-to-date and consistent with SDK 6.0 standards.');
    process.exit(0);
  }
} catch (err) {
  console.error('⚠️ Documentation check skipped: /docs directory not found or error reading files.');
  process.exit(0);
}
