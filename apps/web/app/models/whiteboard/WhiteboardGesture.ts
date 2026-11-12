import type { GestureArrow } from "@/models/whiteboard/GestureArrow";
import type { GestureConnecting } from "@/models/whiteboard/GestureConnecting";
import type { GestureDrawing } from "@/models/whiteboard/GestureDrawing";
import type { GestureEnd } from "@/models/whiteboard/GestureEnd";
import type { GestureMarquee } from "@/models/whiteboard/GestureMarquee";
import type { GestureMoving } from "@/models/whiteboard/GestureMoving";
import type { GesturePanning } from "@/models/whiteboard/GesturePanning";
import type { GesturePlacing } from "@/models/whiteboard/GesturePlacing";
import type { GesturePressed } from "@/models/whiteboard/GesturePressed";
import type { GestureResizing } from "@/models/whiteboard/GestureResizing";

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
