import type { AnimationKey } from "#src/models/keys/AnimationKey";
import type { Types } from "phaser";

export interface AnimationConfiguration {
  animations: Types.Animations.Animation[];
  playAnimationKey: AnimationKey;
}
