// The scale a pinch moves to is the start scale times the ratio of the fingers' distance now to its distance then.
// That ratio keeps a pinch feeling the same at every zoom.
// A distance of zero then has no ratio, so the start scale stands.
export const getPanzoomPinchScale = (startScale: number, startDistance: number, distance: number): number =>
  startDistance > 0 ? (startScale * distance) / startDistance : startScale;
