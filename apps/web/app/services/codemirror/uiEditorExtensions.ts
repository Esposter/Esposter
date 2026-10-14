import type { Extension } from "@codemirror/state";

import { UiToken } from "@/models/ui/UiToken";
import { uiHighlightSpecs } from "@/services/codemirror/uiHighlightSpecs";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "codemirror";

// The code viewer's chrome and highlighting in the UI library's tokens, in place of a bundled theme. The upstream
// One Dark theme's audit, and why nothing reachable overturns the replacement, is on the code viewer page. The editor
// Draws no background of its own, so the frame it sits in shows through, and the text takes the token the app's text takes
export const uiEditorExtensions: Extension[] = [
  EditorView.theme({
    "&": { backgroundColor: "transparent", color: `var(--ui-${UiToken.Text})` },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, & .cm-selectionBackground": {
      backgroundColor: `color-mix(in srgb, var(--ui-${UiToken.Accent}) 25%, transparent)`,
    },
    ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "transparent" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: `var(--ui-${UiToken.Accent})` },
    ".cm-gutters": { backgroundColor: "transparent", border: "none", color: `var(--ui-${UiToken.Muted})` },
  }),
  syntaxHighlighting(HighlightStyle.define(uiHighlightSpecs)),
];
