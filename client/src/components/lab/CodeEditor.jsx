import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const darkHighlight = HighlightStyle.define([
  { tag: tags.keyword,                    color: '#cba6f7' },
  { tag: tags.string,                     color: '#a6e3a1' },
  { tag: tags.comment,                    color: '#6c7086', fontStyle: 'italic' },
  { tag: tags.number,                     color: '#fab387' },
  { tag: [tags.bool, tags.null],          color: '#fab387' },
  { tag: tags.operator,                   color: '#89dceb' },
  { tag: tags.propertyName,               color: '#89b4fa' },
  { tag: tags.function(tags.variableName), color: '#89b4fa' },
  { tag: tags.definition(tags.variableName), color: '#cdd6f4' },
  { tag: tags.typeName,                   color: '#f9e2af' },
  { tag: tags.punctuation,                color: '#cdd6f4' },
]);

const darkTheme = EditorView.theme(
  {
    '&': { background: '#1e1e2e', color: '#cdd6f4', height: '100%' },
    '.cm-scroller': { overflow: 'auto', fontFamily: "ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace", fontSize: '13px' },
    '.cm-content': { caretColor: '#f5e0dc', padding: '8px 0' },
    '.cm-cursor': { borderLeftColor: '#f5e0dc' },
    '.cm-gutters': { background: '#181825', color: '#6c7086', border: 'none', borderRight: '1px solid #313244' },
    '.cm-gutterElement': { padding: '0 10px 0 6px' },
    '.cm-activeLine': { background: '#313244' },
    '.cm-activeLineGutter': { background: '#313244' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      background: '#45475a !important',
    },
    '.cm-line': { padding: '0 8px' },
  },
  { dark: true },
);

export default function CodeEditor({ value, onChange }) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value ?? '',
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          javascript(),
          syntaxHighlighting(darkHighlight),
          darkTheme,
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current?.(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // mount once — value synced below

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value ?? '' },
      });
    }
  }, [value]);

  return <div ref={containerRef} style={{ height: '100%' }} />;
}
