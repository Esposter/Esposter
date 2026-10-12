import { OUTLINE_PROJECTION_SCALE } from "#src/character/shading/constants";

// The outline's depth D from a view-space z and the projection's y scale: the page's k times the depth, positive ahead
export const getOutlineDepth = (viewZ: number, projectionYScale: number): number =>
  -(OUTLINE_PROJECTION_SCALE / projectionYScale) * viewZ;
