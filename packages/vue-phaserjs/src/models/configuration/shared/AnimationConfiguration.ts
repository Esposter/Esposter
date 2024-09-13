import type { AnimationKey } from "@/models/keys/AnimationKey";
import type { Types } from "phaser";

export interface AnimationConfiguration {
  animations: Types.Animations.Animation[];
  playAnimationKey: AnimationKey;
}
