// A piece of a screen's interface as the fit writes it for the screen to place, in canvas units with its y running up:
// Its anchors, pivot, the pivot's offset from its anchors and how far its size strays from their span, as the world
// Package's `GameRect` reads them, and its scale where it is not one
export interface FittedInterfaceRect {
  anchorMax: [number, number];
  anchorMin: [number, number];
  pivot: [number, number];
  position: [number, number];
  scale?: [number, number];
  size: [number, number];
}
