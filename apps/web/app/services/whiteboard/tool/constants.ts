import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { GestureTool } from "@/models/whiteboard/GestureTool";

// The tools the toolbar chooses between, each a mark and its name
export const WHITEBOARD_TOOL_ITEMS: UiMenuItem<GestureTool>[] = [
  { meaning: UiIconMeaning.Pointer, title: "Select", value: GestureTool.Select },
  { meaning: UiIconMeaning.Arrow, title: "Arrow", value: GestureTool.Arrow },
  { meaning: UiIconMeaning.Hand, title: "Hand", value: GestureTool.Hand },
  { meaning: UiIconMeaning.Pen, title: "Freehand", value: GestureTool.Freehand },
  { meaning: UiIconMeaning.Block, title: "Shape", value: GestureTool.Shape },
  { meaning: UiIconMeaning.ReadableText, title: "Text", value: GestureTool.Text },
  { meaning: UiIconMeaning.Edit, title: "Sticky note", value: GestureTool.StickyNote },
];
