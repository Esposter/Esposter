import type { Bounds, Point } from "vue-block-editor-headless";

import { MINIMUM_ELEMENT_SIZE } from "@/services/whiteboard/gesture/constants";

// The box a placing drag from its press's point to the pointer's point takes: the corner the press holds, extended toward the pointer,
// And never smaller than the minimum element size, so a drag that barely moves still places an element
export const getDraggedBounds = (origin: Point, point: Point): Bounds => {
  const width = Math.max(MINIMUM_ELEMENT_SIZE, Math.abs(point.x - origin.x));
  const height = Math.max(MINIMUM_ELEMENT_SIZE, Math.abs(point.y - origin.y));
  return {
    height,
    width,
    x: point.x < origin.x ? origin.x - width : origin.x,
    y: point.y < origin.y ? origin.y - height : origin.y,
  };
};
