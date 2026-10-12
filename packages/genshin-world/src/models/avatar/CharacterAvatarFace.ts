import type { FaceDraw } from "genshin-engine";
import type { Bone } from "three";

// A face of the game's model: its draw, set each frame from the light, and the root bone its angle to the light is read
// From
export interface CharacterAvatarFace {
  draw: FaceDraw;
  root: Bone;
}
