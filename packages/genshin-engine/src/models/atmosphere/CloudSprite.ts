// One painted cloud as the shapes it is drawn with, in a unit square with y up: every loop round the cloud, and every
// Loop round its lit crown, an outer ring counterclockwise and a hole clockwise
export interface CloudSprite {
  lit: [number, number][][];
  outline: [number, number][][];
}
