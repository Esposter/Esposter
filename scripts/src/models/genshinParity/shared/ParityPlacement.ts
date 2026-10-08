// A wiki crop's place in the whole frame it was cut from: the frame's size, and the crop's top left corner in it, in the
// Frame's pixels at the crop's own scale
export interface ParityPlacement {
  frameHeight: number;
  frameWidth: number;
  x: number;
  y: number;
}
