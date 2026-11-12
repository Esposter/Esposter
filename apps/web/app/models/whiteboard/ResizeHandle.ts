// The handle of a selected element or selection a press grabs to resize it. An edge handle moves its side, and a corner moves the two sides it sits
// On: the bottom-right corner stretches the box, and the top-left corner moves its top and left edges
export enum ResizeHandle {
  Bottom = "bottom",
  BottomRight = "bottomRight",
  Left = "left",
  Right = "right",
  Top = "top",
  TopLeft = "topLeft",
}
