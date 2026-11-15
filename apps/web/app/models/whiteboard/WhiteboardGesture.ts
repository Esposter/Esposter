import type { GestureArrow } from "#src/models/whiteboard/GestureArrow";
import type { GestureConnecting } from "#src/models/whiteboard/GestureConnecting";
import type { GestureDrawing } from "#src/models/whiteboard/GestureDrawing";
import type { GestureEnd } from "#src/models/whiteboard/GestureEnd";
import type { GestureMarquee } from "#src/models/whiteboard/GestureMarquee";
import type { GestureMoving } from "#src/models/whiteboard/GestureMoving";
import type { GesturePanning } from "#src/models/whiteboard/GesturePanning";
import type { GesturePlacing } from "#src/models/whiteboard/GesturePlacing";
import type { GesturePressed } from "#src/models/whiteboard/GesturePressed";
import type { GestureResizing } from "#src/models/whiteboard/GestureResizing";

// The gesture in progress on a whiteboard, one of its phases
export type WhiteboardGesture =
  | GestureArrow
  | GestureConnecting
  | GestureDrawing
  | GestureEnd
  | GestureMarquee
  | GestureMoving
  | GesturePanning
  | GesturePlacing
  | GesturePressed
  | GestureResizing;
