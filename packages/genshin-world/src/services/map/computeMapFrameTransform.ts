// The same frame as `projectMapPoint`, written as an SVG transform for a drawing whose points are still the catalogue's.
// It is a quarter turn about the view's centre, so every radius and stroke keeps its own size.
export const computeMapFrameTransform = (centre: { x: number; z: number }): string =>
  `matrix(0 -1 1 0 ${-centre.z} ${centre.x})`;
