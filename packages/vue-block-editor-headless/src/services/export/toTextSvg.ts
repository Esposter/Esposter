import type { TextPlacement } from "#src/models/export/TextPlacement";

import { TEXT_FONT_FAMILY, TEXT_FONT_SIZE } from "#src/services/export/constants";
import { escapeSvgValue } from "#src/services/export/escapeSvgValue";
import { getTextLayout } from "#src/services/export/getTextLayout";

// A text as SVG text in the colour it is given, wrapped at its placement's width, one line for each line it wraps to, on the baseline its layout places it at
export const toTextSvg = (text: string, placement: TextPlacement, color: string): string => {
  if (!text) return "";
  const { point, textAnchor } = placement;
  const { baselineY, lines } = getTextLayout(text, placement);
  const tspans = lines
    .map(({ dy, text: line }) => `<tspan x="${point.x}" dy="${dy}">${escapeSvgValue(line)}</tspan>`)
    .join("");
  return `<text x="${point.x}" y="${baselineY}" text-anchor="${textAnchor}" font-family="${TEXT_FONT_FAMILY}" font-size="${TEXT_FONT_SIZE}" fill="${escapeSvgValue(color)}">${tspans}</text>`;
};
