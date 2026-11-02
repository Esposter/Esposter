import type { GestureTool } from "@/models/whiteboard/GestureTool";
import type { Viewport } from "@/models/whiteboard/Viewport";
import type { WhiteboardGesture } from "@/models/whiteboard/WhiteboardGesture";
import type { PositionedDocument } from "headless-block-editor";

// Everything a whiteboard's pointer gestures read and write: the committed document, the document as a gesture would leave it,
// The selection, the tool, the viewport, and the gesture in progress. The gesture is absent when no press is held
export interface WhiteboardGestureState {
  // Makes the id of a stroke at its press, so the reducer stays pure and a test can fix the id
  createId: () => string;
  document: PositionedDocument;
  gesture?: WhiteboardGesture;
  // Whether a move or a resize lands its edges on the grid
  isSnapEnabled: boolean;
  // The document as the gesture in progress would leave it, drawn in place of the document while the gesture lasts
  preview?: PositionedDocument;
  selectedIds: string[];
  tool: GestureTool;
  viewport: Viewport;
}
