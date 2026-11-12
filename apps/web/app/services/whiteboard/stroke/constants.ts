import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { DashPattern, StrokeWidth } from "vue-block-editor-headless";

// The widths a shape, a sticky note, an arrow or a freehand stroke takes, each named as the properties panel offers it
export const WHITEBOARD_STROKE_WIDTH_ITEMS: UiMenuItem<StrokeWidth>[] = [
  { title: "Thin", value: StrokeWidth.Thin },
  { title: "Medium", value: StrokeWidth.Medium },
  { title: "Bold", value: StrokeWidth.Bold },
];
// The dash patterns a shape's or a sticky note's outline and an arrow's route take, each named as the properties panel offers it
export const WHITEBOARD_DASH_PATTERN_ITEMS: UiMenuItem<DashPattern>[] = [
  { title: "Solid", value: DashPattern.Solid },
  { title: "Dashed", value: DashPattern.Dashed },
  { title: "Dotted", value: DashPattern.Dotted },
];
