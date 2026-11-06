import type { Point } from "#src/models/Point";

// Whether a direction runs along the vertical axis; a free end has none, and a route leaves one along the horizontal axis
export const checkIsVertical = (direction: Point | undefined): boolean => direction?.x === 0;
