import type { TextPlacement } from "#src/models/export/TextPlacement";

import { wrapParagraph } from "#src/services/export/wrapParagraph";

// A text's lines: each newline breaks the text, and the paragraph between two of them wraps at the width when the text is wrapped
// An unwrapped text has no width to wrap at, so it breaks only at its newlines
export const getWrappedLines = (
  text: string,
  { isWrapped, textSize, width }: Pick<TextPlacement, "isWrapped" | "textSize" | "width">,
): string[] => {
  const wrapWidth = isWrapped ? width : Number.POSITIVE_INFINITY;
  return text.split("\n").flatMap((paragraph) => wrapParagraph(paragraph, wrapWidth, textSize));
};
