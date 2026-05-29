import { transformCode } from './babelTransform.js';

const REACT_CDN = [
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
];

// Prevents </script> in injected code from closing the surrounding script tag
function escapeForScript(str) {
  return str.replace(/<\/script/gi, '<\\/script');
}

export function createSandboxHTML(studentCode, testCases, labType, nonce = '') {
  let finalCode = studentCode;

  if (labType === 'react') {
    const { code, error } = transformCode(studentCode);
    finalCode = error
      ? `throw new Error(${JSON.stringify('Syntax error: ' + error)});`
      : code;
  }

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
<head><meta charset="utf-8"></head>
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
