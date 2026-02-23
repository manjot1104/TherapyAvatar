// Postinstall script to patch @realtimex/piper-tts-web for browser-only usage
const fs = require('fs');
const path = require('path');

const piperTtsPath = path.join(__dirname, '..', 'node_modules', '@realtimex', 'piper-tts-web', 'dist', 'piper-o91UDS6e.js');

if (fs.existsSync(piperTtsPath)) {
  let content = fs.readFileSync(piperTtsPath, 'utf8');
  
  // Patch require("fs") and require("path") to empty objects
  content = content.replace(/var fs = require\("fs"\);/g, 'var fs = {}; // require("fs"); // Patched for browser-only');
  content = content.replace(/var nodePath = require\("path"\);/g, 'var nodePath = {}; // require("path"); // Patched for browser-only');
  content = content.replace(/require\("fs"\)\.readFile/g, '({ readFile: function() {} }).readFile');
  
  fs.writeFileSync(piperTtsPath, content, 'utf8');
  console.log('✓ Patched @realtimex/piper-tts-web for browser-only usage');
} else {
  console.log('⚠ @realtimex/piper-tts-web not found, skipping patch');
}
