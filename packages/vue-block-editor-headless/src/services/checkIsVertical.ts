import type { Point } from "#src/models/Point";

// Whether a direction runs along the vertical axis.
// A free end has no axis, and a route leaves one along the horizontal axis.
export const checkIsVertical = (direction: Point | undefined): boolean => direction?.x === 0;
