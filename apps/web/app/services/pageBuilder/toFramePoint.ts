// A viewport point converted to the frame's own pixels: offset by the frame's corner, then divided by the frame's scale
export const toFramePoint = (
  clientPoint: { x: number; y: number },
  frameRect: { left: number; top: number },
  scale: number,
) => ({ x: (clientPoint.x - frameRect.left) / scale, y: (clientPoint.y - frameRect.top) / scale });
