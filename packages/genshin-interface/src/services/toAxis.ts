// One axis of a RectTransform as CSS along it: the offset of its start from its parent's start (the left, or the
// Foot, since Unity's y runs up) and its length, each a share of the parent's span and a length in canvas units, the
// Start being Unity's offsetMin from the lower anchor
export const toAxis = (
  anchorMin: number,
  anchorMax: number,
  offsetMin: number,
  size: number,
  span: string,
  start: string,
): [string, string] => [
  `calc(${start} + ${anchorMin} * ${span} + ${offsetMin} * var(--canvas-unit))`,
  `calc(${anchorMax - anchorMin} * ${span} + ${size} * var(--canvas-unit))`,
];
