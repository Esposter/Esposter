import type { DoorRelief } from "#src/models/genshinAssets/fit/DoorRelief";
import type { ReliefLayer } from "#src/models/genshinAssets/fit/ReliefLayer";

// The login door fitted: its frame and panel each as the layers its front stands out in, where the scene stands it,
// Its front's relief and its size
export interface LoginDoor {
  frame: ReliefLayer[];
  panel: ReliefLayer[];
  position: [number, number, number];
  relief: DoorRelief;
  size: [number, number, number];
}
