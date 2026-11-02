import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { ArrowPathKind } from "headless-block-editor";

// The routes an arrow can take, each named as the properties panel offers it
export const WHITEBOARD_PATH_KIND_ITEMS: UiMenuItem<ArrowPathKind>[] = [
  { title: "Straight", value: ArrowPathKind.Straight },
  { title: "Curved", value: ArrowPathKind.Curved },
  { title: "Right-angled", value: ArrowPathKind.RightAngled },
];
