import { WHITEBOARD_MAX_SCALE, WHITEBOARD_MIN_SCALE } from "@/services/whiteboard/viewport/constants";

// A scale held within the range the canvas zooms to
export const getClampedScale = (scale: number): number =>
  Math.min(WHITEBOARD_MAX_SCALE, Math.max(WHITEBOARD_MIN_SCALE, scale));
