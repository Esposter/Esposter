import type { DoorRelief } from "#src/models/genshinAssets/fit/DoorRelief";

// The login door fitted: its frame and panel each as its loops and the depths its front and back stand at, where the
// Scene stands it, its front's relief and its size
export interface LoginDoor {
  frame: { depth: [number, number]; loops: [number, number][][] };
  panel: { depth: [number, number]; loops: [number, number][][] };
  position: [number, number, number];
  relief: DoorRelief;
  size: [number, number, number];
}
