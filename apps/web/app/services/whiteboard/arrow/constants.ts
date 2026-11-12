import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { ArrowheadKind, ArrowPathKind } from "vue-block-editor-headless";

// The arrowheads an arrow's end can take, each named as the properties panel offers it
export const WHITEBOARD_ARROWHEAD_ITEMS: UiMenuItem<ArrowheadKind>[] = [
  { title: "Triangle", value: ArrowheadKind.Triangle },
  { title: "Diamond", value: ArrowheadKind.Diamond },
  { title: "Circle", value: ArrowheadKind.Circle },
  { title: "Bar", value: ArrowheadKind.Bar },
];
// The routes an arrow can take, each named as the properties panel offers it
export const WHITEBOARD_PATH_KIND_ITEMS: UiMenuItem<ArrowPathKind>[] = [
  { title: "Straight", value: ArrowPathKind.Straight },
  { title: "Curved", value: ArrowPathKind.Curved },
  { title: "Right-angled", value: ArrowPathKind.RightAngled },
];
