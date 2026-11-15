import { ResizeHandle } from "#src/models/whiteboard/ResizeHandle";

// The sides of a box a resize handle moves: an edge moves its own side, and a corner moves the two sides it sits on
export const getResizedSides = (
  handle: ResizeHandle,
): { bottom: boolean; left: boolean; right: boolean; top: boolean } => ({
  bottom: handle === ResizeHandle.Bottom || handle === ResizeHandle.BottomRight,
  left: handle === ResizeHandle.Left || handle === ResizeHandle.TopLeft,
  right: handle === ResizeHandle.BottomRight || handle === ResizeHandle.Right,
  top: handle === ResizeHandle.Top || handle === ResizeHandle.TopLeft,
});
