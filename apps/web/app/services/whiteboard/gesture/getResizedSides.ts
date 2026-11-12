import { ResizeHandle } from "@/models/whiteboard/ResizeHandle";

// The sides of a box a resize handle moves: an edge moves its own side, and a corner moves the two sides it sits on
export const getResizedSides = (
  handle: ResizeHandle,
): { bottom: boolean; left: boolean; right: boolean; top: boolean } => ({
  bottom: [ResizeHandle.Bottom, ResizeHandle.BottomRight].includes(handle),
  left: [ResizeHandle.Left, ResizeHandle.TopLeft].includes(handle),
  right: [ResizeHandle.BottomRight, ResizeHandle.Right].includes(handle),
  top: [ResizeHandle.Top, ResizeHandle.TopLeft].includes(handle),
});
