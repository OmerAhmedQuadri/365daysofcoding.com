import * as Babel from '@babel/standalone';

export function transformCode(code) {
  try {
    const result = Babel.transform(code, {
      presets: ['react'],
      filename: 'lab.jsx',
    });
    return { code: result.code, error: null };
  } catch (err) {
    return { code: null, error: err.message };
  }
}
