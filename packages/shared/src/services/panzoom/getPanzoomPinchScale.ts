// The scale a pinch moves to: the scale the gesture started at, times the ratio of the fingers' distance now to the distance then,
// So a pinch feels the same at every zoom. A distance of zero then has no ratio, so the start scale stands
export const getPanzoomPinchScale = (startScale: number, startDistance: number, distance: number): number =>
  startDistance > 0 ? (startScale * distance) / startDistance : startScale;
