import type { ReliefLayer } from "#src/models/genshinAssets/fit/ReliefLayer";

// One piece of the login door, as one of its mesh's bones carries it: its frame and panel each as the layers its front
// Stands out in, and its lift, where it stands and how it is turned at each sample of the clip it rises by, carrying it
// From where it rests (x, y and z, then its turn as a quaternion's x, y, z and w)
export interface LoginDoorPiece {
  frame: ReliefLayer[];
  lift: number[][];
  panel: ReliefLayer[];
}
