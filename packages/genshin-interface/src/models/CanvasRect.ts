// A piece of the interface as the game's RectTransform places it, in canvas units: the share of its parent's box its
// Lower-left and upper-right corners anchor to, the share of its own box its pivot sits at, the pivot's offset from
// Its anchors, and how far its size strays from the anchors' span. Its y runs up the screen, as Unity's does
export interface CanvasRect {
  anchorMax: [number, number];
  anchorMin: [number, number];
  pivot: [number, number];
  position: [number, number];
  size: [number, number];
}
