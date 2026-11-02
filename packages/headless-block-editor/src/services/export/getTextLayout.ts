import type { TextLayout } from "#src/models/export/TextLayout";
import type { TextPlacement } from "#src/models/export/TextPlacement";

import { TextAnchor } from "#src/models/export/TextAnchor";
import { TEXT_FONT_SIZE, TEXT_LINE_HEIGHT } from "#src/services/export/constants";
import { getWrappedLines } from "#src/services/export/getWrappedLines";

// A text's lines, wrapped at the placement's width and laid out against the point they are drawn at
// A centred block's first baseline sits a third of a font size below its middle, which centres the lowercase and capital letters alike
// A start-anchored block's sits a font size below its point. Each line after the first steps down a line height from the line above it
export const getTextLayout = (text: string, { point, textAnchor, width }: TextPlacement): TextLayout => {
  const lines = getWrappedLines(text, width);
  return {
    baselineY:
      textAnchor === TextAnchor.Middle
        ? point.y - ((lines.length - 1) * TEXT_LINE_HEIGHT) / 2 + TEXT_FONT_SIZE / 3
        : point.y + TEXT_FONT_SIZE,
    lines: lines.map((line, index) => ({ dy: index === 0 ? 0 : TEXT_LINE_HEIGHT, text: line })),
  };
};
