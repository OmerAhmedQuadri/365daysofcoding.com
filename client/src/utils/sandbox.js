import { transformCode, LOOP_GUARD_NOW, LOOP_GUARD_DEADLINE } from './babelTransform.js';

const REACT_CDN = [
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
];

// How long student code and tests may run before loops throw.
// Kept below the runner's timeout (testRunner.js) so a stuck loop reports a clear error.
const LOOP_GUARD_MS = 3000;

// What code inside the sandbox may do: run inline scripts and load React from unpkg.
// Everything else is blocked: fetch/XHR/WebSocket, images, nested frames, workers, eval.
const CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' https://unpkg.com",
  "style-src 'unsafe-inline'",
  'img-src data:',
  "base-uri 'none'",
].join('; ');

// Prevents </script> in injected code from closing the surrounding script tag
function escapeForScript(str) {
  return str.replace(/<\/script/gi, '<\\/script');
}

export function createSandboxHTML(studentCode, testCases, labType, nonce = '') {
  const { code, error } = transformCode(studentCode, { jsx: labType === 'react' });
  const finalCode = error
    ? `throw new Error(${JSON.stringify('Syntax error: ' + error)});`
    : code;

  const reactScripts = labType === 'react'
    ? REACT_CDN.map(url => `<script src="${url}"></script>`).join('\n')
    : '';

  const rootDiv = labType === 'react' ? '<div id="root"></div>' : '';

  const testIds = JSON.stringify(testCases.map(t => t.id));
  const testDescs = JSON.stringify(testCases.map(t => t.description));

  const testBlocks = testCases.map(tc => `
  try {
    (function() { ${escapeForScript(tc.test_code)} })();
    __results.push({ id: ${JSON.stringify(tc.id)}, description: ${JSON.stringify(tc.description)}, passed: true, error: null });
  } catch (__e) {
    __results.push({ id: ${JSON.stringify(tc.id)}, description: ${JSON.stringify(tc.description)}, passed: false, error: __e.message });
  }`).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
</head>
<body>
${rootDiv}
<script>
var __results = [];
var __posted = false;
var __testIds = ${testIds};
var __testDescs = ${testDescs};
function __postResults() {
  if (__posted) return;
  __posted = true;
  window.parent.postMessage({ type: 'lab_results', nonce: ${JSON.stringify(nonce)}, results: __results }, '*');
}
window.onerror = function(msg) {
  __testIds.forEach(function(id, i) {
    if (!__results.find(function(r) { return r.id === id; })) {
      __results.push({ id: id, description: __testDescs[i], passed: false, error: String(msg) });
    }
  });
  __postResults();
  return true;
};
</script>
${reactScripts}
<script>
const ${LOOP_GUARD_NOW} = Date.now;
const ${LOOP_GUARD_DEADLINE} = ${LOOP_GUARD_NOW}() + ${LOOP_GUARD_MS};
</script>
<script>
${escapeForScript(finalCode)}
</script>
<script>
(function() {
  if (__posted) return;
${testBlocks}
  __postResults();
})();
</script>
</body>
</html>`;
}
