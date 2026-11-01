// The scale a pinch moves to: the scale the gesture started at, times the ratio of the fingers' distance now to the distance then,
// So a pinch feels the same at every zoom
export const getPanzoomPinchScale = (startScale: number, startDistance: number, distance: number): number =>
  (startScale * distance) / startDistance;
