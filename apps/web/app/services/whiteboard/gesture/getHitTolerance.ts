import { HIT_TOLERANCE } from "@/services/whiteboard/gesture/constants";

// The distance in document units a pointer hits an element within at a scale, since the tolerance is held in screen pixels
export const getHitTolerance = (scale: number): number => HIT_TOLERANCE / scale;
