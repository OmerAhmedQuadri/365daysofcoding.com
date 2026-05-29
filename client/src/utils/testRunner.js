import { createSandboxHTML } from './sandbox.js';

const TIMEOUT_MS = 5000;

export function runTests(studentCode, testCases, labType) {
  return new Promise((resolve) => {
    const nonce = Math.random().toString(36).slice(2);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.display = 'none';

    let settled = false;
    let timeoutId;

    function cleanup() {
      clearTimeout(timeoutId);
      window.removeEventListener('message', onMessage);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }

    function settle(results) {
      if (settled) return;
      settled = true;
      cleanup();
      const tests_passed = results.filter(r => r.passed).length;
      const tests_total = results.length;
      resolve({
        results,
        tests_passed,
        tests_total,
        status: tests_total > 0 && tests_passed === tests_total ? 'passed' : 'failed',
      });
    }

    function onMessage(event) {
      if (event.source !== iframe.contentWindow) return;
      if (!event.data || event.data.type !== 'lab_results') return;
      if (event.data.nonce !== nonce) return;
      settle(event.data.results);
    }

    window.addEventListener('message', onMessage);

    timeoutId = setTimeout(() => {
      settle(testCases.map(tc => ({
        id: tc.id,
        description: tc.description,
        passed: false,
        error: 'Timed out',
      })));
    }, TIMEOUT_MS);

    iframe.srcdoc = createSandboxHTML(studentCode, testCases, labType, nonce);
    document.body.appendChild(iframe);
  });
}
