import {
  ConnectionLineType,
  getBezierPath,
  getSimpleBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from "@vue-flow/core";

// The path an edge of each type is drawn along, as Vue Flow's own [path, labelX, labelY, …] tuple, so an edge in the
// Editor and the same edge published sit alike
export const EdgePathMap = {
  [ConnectionLineType.Bezier]: getBezierPath,
  [ConnectionLineType.SimpleBezier]: getSimpleBezierPath,
  [ConnectionLineType.SmoothStep]: getSmoothStepPath,
  [ConnectionLineType.Step]: (params: Parameters<typeof getSmoothStepPath>[0]) =>
    getSmoothStepPath({ ...params, borderRadius: 0 }),
  [ConnectionLineType.Straight]: getStraightPath,
};
