import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { ShapeKind } from "headless-block-editor";

// The palette and shortcuts dialog list every whiteboard command under this group
export const WHITEBOARD_COMMAND_GROUP = "Whiteboard";
// How far one arrow key nudges the selection in document units, and how far it nudges with Shift
export const WHITEBOARD_NUDGE_STEP = 1;
export const WHITEBOARD_NUDGE_LARGE_STEP = 10;
// The unit direction each arrow key nudges a selection in, and the mark its commands wear
export const WHITEBOARD_NUDGE_DIRECTIONS = {
  ArrowDown: { direction: "down", meaning: UiIconMeaning.ArrowDown, point: { x: 0, y: 1 } },
  ArrowLeft: { direction: "left", meaning: UiIconMeaning.ArrowLeft, point: { x: -1, y: 0 } },
  ArrowRight: { direction: "right", meaning: UiIconMeaning.ArrowRight, point: { x: 1, y: 0 } },
  ArrowUp: { direction: "up", meaning: UiIconMeaning.ArrowUp, point: { x: 0, y: -1 } },
} as const;
// The key each tool is chosen by, with the mark and the name its command wears
export const WHITEBOARD_TOOL_SHORTCUTS = {
  a: { meaning: UiIconMeaning.Arrow, title: "Arrow", tool: GestureTool.Arrow },
  h: { meaning: UiIconMeaning.Hand, title: "Hand", tool: GestureTool.Hand },
  n: { meaning: UiIconMeaning.Edit, title: "Sticky note", tool: GestureTool.StickyNote },
  p: { meaning: UiIconMeaning.Pen, title: "Freehand", tool: GestureTool.Freehand },
  t: { meaning: UiIconMeaning.ReadableText, title: "Text", tool: GestureTool.Text },
  v: { meaning: UiIconMeaning.Pointer, title: "Select", tool: GestureTool.Select },
} as const;
// The key each shape is placed by with the shape tool, which places the shape its key names. Its mark is the palette's icon for that kind
export const WHITEBOARD_SHAPE_SHORTCUTS = {
  d: { kind: ShapeKind.Diamond, title: "Diamond" },
  o: { kind: ShapeKind.Ellipse, title: "Ellipse" },
  r: { kind: ShapeKind.Rectangle, title: "Rectangle" },
} as const;
