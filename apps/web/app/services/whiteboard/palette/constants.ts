import type { WhiteboardPaletteGroup } from "@/models/whiteboard/WhiteboardPaletteGroup";
import type { Size } from "headless-block-editor";

import { PositionedElementType, ShapeKind } from "headless-block-editor";

// The size each thing the palette places takes, in document units. A shape's text is drawn inside its box
export const WHITEBOARD_SHAPE_SIZE: Size = { height: 80, width: 120 };
export const WHITEBOARD_STICKY_NOTE_SIZE: Size = { height: 120, width: 160 };
// A text box stores no height, since its text sets it, so this height is only the room it is centred in when placed
export const WHITEBOARD_TEXT_BOX_SIZE: Size = { height: 40, width: 160 };
export const WHITEBOARD_IMAGE_SIZE: Size = { height: 240, width: 240 };
// How far each image of a multi-file insert sits from the one picked before it, in document units: half its width, so every image
// Shows past the one over it
export const WHITEBOARD_IMAGE_INSERT_OFFSET = WHITEBOARD_IMAGE_SIZE.width / 2;
// The fill a placed shape and sticky note start with, which the properties panel changes
export const WHITEBOARD_SHAPE_FILL = "#ffffff";
export const WHITEBOARD_STICKY_NOTE_FILL = "#fde68a";
// The text a placed text box starts with, so it draws and can be double clicked to edit
export const WHITEBOARD_TEXT_BOX_TEXT = "Text";

export const WHITEBOARD_PALETTE_GROUPS: WhiteboardPaletteGroup[] = [
  {
    items: [
      { kind: ShapeKind.Rectangle, title: "Rectangle", type: PositionedElementType.Shape },
      { kind: ShapeKind.Ellipse, title: "Ellipse", type: PositionedElementType.Shape },
      { kind: ShapeKind.Diamond, title: "Diamond", type: PositionedElementType.Shape },
      { kind: ShapeKind.Terminal, title: "Terminal", type: PositionedElementType.Shape },
      { kind: ShapeKind.Process, title: "Process", type: PositionedElementType.Shape },
      { kind: ShapeKind.Decision, title: "Decision", type: PositionedElementType.Shape },
      { kind: ShapeKind.InputOutput, title: "Input/Output", type: PositionedElementType.Shape },
      { kind: ShapeKind.PredefinedProcess, title: "Predefined Process", type: PositionedElementType.Shape },
      { kind: ShapeKind.Annotation, title: "Annotation", type: PositionedElementType.Shape },
    ],
    title: "Shapes",
  },
  {
    items: [
      { title: "Sticky note", type: PositionedElementType.StickyNote },
      { title: "Text box", type: PositionedElementType.Text },
    ],
    title: "Notes",
  },
];
