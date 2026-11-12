import type { StrokeAttributes } from "#src/models/export/StrokeAttributes";

import { escapeSvgValue } from "#src/services/export/escapeSvgValue";

// A line's attributes as the export writes them into an SVG element: its colour and width, then its dash array and cap only when its pattern takes them
export const toStrokeAttributesSvg = ({
  stroke,
  strokeDasharray,
  strokeLinecap,
  strokeWidth,
}: StrokeAttributes): string =>
  [
    `stroke="${escapeSvgValue(stroke)}"`,
    `stroke-width="${strokeWidth}"`,
    strokeDasharray ? `stroke-dasharray="${strokeDasharray}"` : "",
    strokeLinecap ? `stroke-linecap="${strokeLinecap}"` : "",
  ]
    .filter((attribute) => Boolean(attribute))
    .join(" ");
