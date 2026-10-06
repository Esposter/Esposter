import type { DoorRelief } from "#src/models/genshinAssets/fit/DoorRelief";
import type { LoginDoorPiece } from "#src/models/genshinAssets/fit/LoginDoorPiece";

// The login door fitted: the pieces its mesh's bones carry, their lifts sampled so many times a second, where the scene
// Stands it, its front's relief and its size
export interface LoginDoor {
  liftRate: number;
  pieces: LoginDoorPiece[];
  position: [number, number, number];
  relief: DoorRelief;
  size: [number, number, number];
}
