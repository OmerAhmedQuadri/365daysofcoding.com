import * as Babel from '@babel/standalone';

// Defined by the sandbox (sandbox.js) before student code runs
export const LOOP_GUARD_NOW = '__loopGuardNow';
export const LOOP_GUARD_DEADLINE = '__loopGuardDeadline';

// Adds a time check to the start of every loop body, so an infinite loop throws
// an error instead of freezing the browser tab.
function loopGuard({ types: t }) {
  const guarded = new WeakSet();

  return {
    visitor: {
      'WhileStatement|DoWhileStatement|ForStatement|ForInStatement|ForOfStatement'(path) {
        if (guarded.has(path.node)) return;
        guarded.add(path.node);

        const check = t.ifStatement(
          t.binaryExpression(
            '>',
            t.callExpression(t.identifier(LOOP_GUARD_NOW), []),
            t.identifier(LOOP_GUARD_DEADLINE),
          ),
          t.throwStatement(
            t.newExpression(t.identifier('Error'), [
              t.stringLiteral('Your code took too long to run. Check for an infinite loop.'),
            ]),
          ),
        );

        const body = path.get('body');
        if (body.isBlockStatement()) {
          body.unshiftContainer('body', check);
        } else {
          body.replaceWith(t.blockStatement([check, body.node]));
        }
      },
    },
  };
}

export function transformCode(code, { jsx = false } = {}) {
  try {
    const result = Babel.transform(code, {
      presets: jsx ? ['react'] : [],
      plugins: [loopGuard],
      filename: jsx ? 'lab.jsx' : 'lab.js',
      sourceType: jsx ? 'module' : 'script',
    });
    return { code: result.code, error: null };
  } catch (err) {
    return { code: null, error: err.message };
  }
}
