// The smallest and largest scale the canvas zooms to, in screen pixels per document unit
export const WHITEBOARD_MIN_SCALE = 0.1;
export const WHITEBOARD_MAX_SCALE = 30;
// The factor one zoom step multiplies the scale by
export const WHITEBOARD_ZOOM_FACTOR = 1.25;
// The scale Ctrl or Cmd with 0 resets the zoom to
export const WHITEBOARD_RESET_SCALE = 1;
// How fast a Ctrl or Cmd wheel turn zooms: the scale is multiplied by e to the power of minus this rate times the turn
export const WHITEBOARD_WHEEL_ZOOM_RATE = 0.002;
// The largest scale a fit takes, which is the document's own size: a fit shrinks a large document but never enlarges a small one
export const WHITEBOARD_FIT_MAX_SCALE = 1;
