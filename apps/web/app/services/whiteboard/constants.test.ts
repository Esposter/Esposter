import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { WhiteboardHistoryEntry } from "@/models/whiteboard/WhiteboardHistoryEntry";
import type { ArrowElement, PositionedDocument, ShapeElement } from "vue-block-editor-headless";

import { MAX_WHITEBOARD_HISTORY_SIZE } from "@/services/resource/whiteboard/constants";
import { createHistory } from "@esposter/shared";
import { describe } from "vitest";
import {
  ArrowPathKind,
  CornerStyle,
  DashPattern,
  PositionedElementType,
  ShapeKind,
  SketchLevel,
  StrokeWidth,
  TextSize,
} from "vue-block-editor-headless";

export const WHITEBOARD_ARROW_ID = crypto.randomUUID();
export const WHITEBOARD_PROCESS_ID = crypto.randomUUID();

// A process shape at the origin, 100 by 100: its bottom point is at (50, 100)
export const WHITEBOARD_PROCESS: ShapeElement = {
  color: "",
  cornerStyle: CornerStyle.Sharp,
  dashPattern: DashPattern.Solid,
  fill: "#ffffff",
  height: 100,
  id: WHITEBOARD_PROCESS_ID,
  kind: ShapeKind.Process,
  sketchLevel: SketchLevel.Artist,
  strokeWidth: StrokeWidth.Medium,
  text: "",
  textSize: TextSize.Small,
  type: PositionedElementType.Shape,
  width: 100,
  x: 0,
  y: 0,
};
// An arrow bound at its start to the process's bottom point, free at its end
export const WHITEBOARD_ARROW: ArrowElement = {
  color: "",
  dashPattern: DashPattern.Solid,
  end: { hasArrowhead: true, point: { x: 150, y: 250 } },
  id: WHITEBOARD_ARROW_ID,
  label: "",
  pathKind: ArrowPathKind.Straight,
  sketchLevel: SketchLevel.Artist,
  start: {
    binding: { connectionPointIndex: 2, elementId: WHITEBOARD_PROCESS_ID },
    hasArrowhead: false,
    point: { x: 50, y: 100 },
  },
  strokeWidth: StrokeWidth.Medium,
  textSize: TextSize.Small,
  type: PositionedElementType.Arrow,
};

// A whiteboard's state at a document, with an undo history that keeps every edit a test makes
export const createWhiteboardEditState = (document: PositionedDocument): WhiteboardEditState => ({
  document,
  history: createHistory<WhiteboardHistoryEntry>(MAX_WHITEBOARD_HISTORY_SIZE),
});

// The event is dispatched on its target, so the target it reports is the element the key was pressed in
export const pressKey = (init: KeyboardEventInit, target: EventTarget = document.body): KeyboardEvent => {
  const event = new KeyboardEvent("keydown", init);
  target.dispatchEvent(event);
  return event;
};

describe.todo("constants");
