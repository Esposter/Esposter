// The part of the document the canvas shows. x and y are the document point at the canvas's top-left, and scale is the number of screen
// Pixels each document unit takes
export interface Viewport {
  scale: number;
  x: number;
  y: number;
}
