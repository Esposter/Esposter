import type { GestureArrow } from "@/models/whiteboard/GestureArrow";
import type { GestureDrawing } from "@/models/whiteboard/GestureDrawing";
import type { GestureMarquee } from "@/models/whiteboard/GestureMarquee";
import type { GestureMoving } from "@/models/whiteboard/GestureMoving";
import type { GesturePanning } from "@/models/whiteboard/GesturePanning";
import type { GesturePressed } from "@/models/whiteboard/GesturePressed";
import type { GestureResizing } from "@/models/whiteboard/GestureResizing";

// The gesture in progress on a whiteboard, one of its phases
export type WhiteboardGesture =
  | GestureArrow
  | GestureDrawing
  | GestureMarquee
  | GestureMoving
  | GesturePanning
  | GesturePressed
  | GestureResizing;
