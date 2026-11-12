import type { StrokeAttributes } from "#src/models/export/StrokeAttributes";
import type { PositionedElement } from "#src/models/PositionedElement";

import { DashPattern } from "#src/models/DashPattern";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { DOTTED_STROKE_DASH_LENGTH, STROKE_DASH_LENGTH, STROKE_GAP_LENGTH } from "#src/services/export/constants";
import { exhaustiveGuard } from "@esposter/shared";

// The dash array and the cap a dash pattern draws with. A dotted line has round caps, so each gap's start draws as a dot
const getDashAttributes = (dashPattern: DashPattern): Pick<StrokeAttributes, "strokeDasharray" | "strokeLinecap"> => {
  switch (dashPattern) {
    case DashPattern.Dashed:
      return { strokeDasharray: `${STROKE_DASH_LENGTH} ${STROKE_GAP_LENGTH}` };
    case DashPattern.Dotted:
      return { strokeDasharray: `${DOTTED_STROKE_DASH_LENGTH} ${STROKE_GAP_LENGTH}`, strokeLinecap: "round" };
    case DashPattern.Solid:
      return {};
    default:
      return exhaustiveGuard(dashPattern);
  }
};

// The attributes that draw an element's outline, route, stroke or text: its colour, width and dash pattern. An element with no colour draws in the
// Default colour given. An element with no width or dash pattern of its own, such as a text box, draws solid at medium width, and a freehand stroke holds a
// Width but no dash pattern, so it draws solid
export const getStrokeAttributes = (element: PositionedElement, defaultColor: string): StrokeAttributes => {
  const color = "color" in element ? element.color : "";
  const dashPattern = "dashPattern" in element ? element.dashPattern : DashPattern.Solid;
  const strokeWidth = "strokeWidth" in element ? element.strokeWidth : StrokeWidth.Medium;
  return { stroke: color || defaultColor, ...getDashAttributes(dashPattern), strokeWidth };
};
