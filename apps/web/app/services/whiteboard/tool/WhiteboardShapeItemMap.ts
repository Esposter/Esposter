import type { WhiteboardShapeItem } from "@/models/whiteboard/WhiteboardShapeItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { ShapeKind } from "vue-block-editor-headless";

// The shapes the shape tool places, in the order its slot's menu lists them: the basic shapes, then the flowchart ones.
// Each is drawn with the icon its meaning names
export const WhiteboardShapeItemMap: Record<ShapeKind, WhiteboardShapeItem> = {
  [ShapeKind.Rectangle]: {
    meaning: UiIconMeaning.Block,
    shortcut: "r",
    title: "Rectangle",
    value: ShapeKind.Rectangle,
  },
  [ShapeKind.Ellipse]: { meaning: UiIconMeaning.Record, shortcut: "o", title: "Ellipse", value: ShapeKind.Ellipse },
  [ShapeKind.Diamond]: { meaning: UiIconMeaning.Tag, shortcut: "d", title: "Diamond", value: ShapeKind.Diamond },
  [ShapeKind.Terminal]: { meaning: UiIconMeaning.Play, title: "Terminal", value: ShapeKind.Terminal },
  [ShapeKind.Process]: { meaning: UiIconMeaning.Settings, title: "Process", value: ShapeKind.Process },
  [ShapeKind.Decision]: { meaning: UiIconMeaning.Poll, title: "Decision", value: ShapeKind.Decision },
  [ShapeKind.InputOutput]: { meaning: UiIconMeaning.Send, title: "Input/Output", value: ShapeKind.InputOutput },
  [ShapeKind.PredefinedProcess]: {
    meaning: UiIconMeaning.Program,
    title: "Predefined Process",
    value: ShapeKind.PredefinedProcess,
  },
  [ShapeKind.Annotation]: { meaning: UiIconMeaning.Comment, title: "Annotation", value: ShapeKind.Annotation },
};
