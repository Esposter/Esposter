import type { WhiteboardToolItem } from "@/models/whiteboard/WhiteboardToolItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { GestureTool } from "@/models/whiteboard/GestureTool";

// The tools the toolbar chooses between, each with its mark, its title and the key that chooses it. The shape tool is the shape slot,
// which holds the shapes, so it is not a member here
export const WhiteboardToolItemMap: Record<Exclude<GestureTool, GestureTool.Shape>, WhiteboardToolItem> = {
  [GestureTool.Arrow]: { meaning: UiIconMeaning.Arrow, shortcut: "a", title: "Arrow", value: GestureTool.Arrow },
  [GestureTool.Freehand]: { meaning: UiIconMeaning.Pen, shortcut: "p", title: "Freehand", value: GestureTool.Freehand },
  [GestureTool.Hand]: { meaning: UiIconMeaning.Hand, shortcut: "h", title: "Hand", value: GestureTool.Hand },
  [GestureTool.Select]: { meaning: UiIconMeaning.Pointer, shortcut: "v", title: "Select", value: GestureTool.Select },
  [GestureTool.StickyNote]: {
    meaning: UiIconMeaning.Edit,
    shortcut: "n",
    title: "Sticky note",
    value: GestureTool.StickyNote,
  },
  [GestureTool.Text]: { meaning: UiIconMeaning.ReadableText, shortcut: "t", title: "Text", value: GestureTool.Text },
};
