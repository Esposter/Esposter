import type { GestureTool } from "@/models/whiteboard/GestureTool";
import type { Viewport } from "@/models/whiteboard/Viewport";
import type { WhiteboardGesture } from "@/models/whiteboard/WhiteboardGesture";
import type { PositionedDocument, ShapeKind } from "vue-block-editor-headless";

// Everything a whiteboard's pointer gestures read and write: the committed document, the document as a gesture would leave it,
// The selection, the tool, the viewport, and the gesture in progress. The gesture is absent when no press is held
export interface WhiteboardGestureState {
  // Makes the id of a stroke at its press, so the reducer stays pure and a test can fix the id
  createId: () => string;
  document: PositionedDocument;
  gesture?: WhiteboardGesture;
  // Whether the tool stays in hand after a placement, rather than returning to select
  isToolLocked: boolean;
  // The document as the gesture in progress would leave it, drawn in place of the document while the gesture lasts
  preview?: PositionedDocument;
  selectedIds: string[];
  // The kind of shape the shape tool places
  shapeKind: ShapeKind;
  tool: GestureTool;
  viewport: Viewport;
}
