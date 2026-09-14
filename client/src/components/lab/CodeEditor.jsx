import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { colors } from '../../theme.js';

const darkHighlight = HighlightStyle.define([
  { tag: tags.keyword,                    color: colors.brand[400] },
  { tag: tags.string,                     color: '#fcd34d' },
  { tag: tags.comment,                    color: colors.fg.subtle, fontStyle: 'italic' },
  { tag: tags.number,                     color: '#fb923c' },
  { tag: [tags.bool, tags.null],          color: '#fb923c' },
  { tag: tags.operator,                   color: '#5eead4' },
  { tag: tags.propertyName,               color: '#93c5fd' },
  { tag: tags.function(tags.variableName), color: '#7dd3fc' },
  { tag: tags.definition(tags.variableName), color: colors.fg.DEFAULT },
  { tag: tags.typeName,                   color: '#c4b5fd' },
  { tag: tags.punctuation,                color: colors.fg.muted },
]);

const darkTheme = EditorView.theme(
  {
    '&': { background: colors.canvas, color: colors.fg.DEFAULT, height: '100%' },
    '.cm-scroller': { overflow: 'auto', fontFamily: "ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace", fontSize: '13px' },
    '.cm-content': { caretColor: colors.brand[400], padding: '8px 0' },
    '.cm-cursor': { borderLeftColor: colors.brand[400] },
    '.cm-gutters': { background: colors.surface, color: colors.fg.subtle, border: 'none', borderRight: `1px solid ${colors.line.DEFAULT}` },
    '.cm-gutterElement': { padding: '0 10px 0 6px' },
    '.cm-activeLine': { background: `${colors.fg.DEFAULT}0d` },
    '.cm-activeLineGutter': { background: colors.raised, color: colors.fg.muted },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      background: `${colors.brand[500]}40 !important`,
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
