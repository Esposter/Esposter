import { wrapParagraph } from "#src/services/export/wrapParagraph";

// A text's lines at a width: each newline breaks the text, and the paragraph between two of them wraps at the width
export const getWrappedLines = (text: string, width: number): string[] =>
  text.split("\n").flatMap((paragraph) => wrapParagraph(paragraph, width));
