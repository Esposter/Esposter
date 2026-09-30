// A RectTransform's layout as its raw export's last 40 bytes hold it, in the canvas's units with its y running up:
// Its anchors' corners as shares of its parent's box, its pivot as a share of its own, the pivot's offset from its
// Anchors, and how far its size strays from the anchors' span
export interface DumpedRectTransform {
  anchoredPosition: [number, number];
  anchorMax: [number, number];
  anchorMin: [number, number];
  pivot: [number, number];
  sizeDelta: [number, number];
}
