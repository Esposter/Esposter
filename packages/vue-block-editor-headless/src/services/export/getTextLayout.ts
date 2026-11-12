import type { TextLayout } from "#src/models/export/TextLayout";
import type { TextPlacement } from "#src/models/export/TextPlacement";

import { VerticalAlignment } from "#src/models/VerticalAlignment";
import { getTextLineHeight } from "#src/services/export/getTextLineHeight";
import { getWrappedLines } from "#src/services/export/getWrappedLines";
import { exhaustiveGuard } from "@esposter/shared";

// The baseline of a text's first line, set by the vertical alignment against the point it is drawn at. A top-aligned block's sits a font size below its point
// A middle-aligned block's sits a third of a size below its middle, less half the block's span, which centres the lowercase and capital letters alike
// A bottom-aligned block's last line sits a third of a size above its point
const getFirstBaselineY = ({ point, textSize, verticalAlignment }: TextPlacement, lineCount: number): number => {
  const blockSpan = (lineCount - 1) * getTextLineHeight(textSize);
  switch (verticalAlignment) {
    case VerticalAlignment.Bottom:
      return point.y - blockSpan - textSize / 3;
    case VerticalAlignment.Middle:
      return point.y - blockSpan / 2 + textSize / 3;
    case VerticalAlignment.Top:
      return point.y + textSize;
    default:
      return exhaustiveGuard(verticalAlignment);
  }
};

// A text's lines, wrapped at the placement's width and laid out against the point they are drawn at. Each line after the first steps down a line from the line above it
export const getTextLayout = (text: string, placement: TextPlacement): TextLayout => {
  const lines = getWrappedLines(text, placement);
  const lineHeight = getTextLineHeight(placement.textSize);
  return {
    baselineY: getFirstBaselineY(placement, lines.length),
    lines: lines.map((line, index) => ({ dy: index === 0 ? 0 : lineHeight, text: line })),
  };
};
