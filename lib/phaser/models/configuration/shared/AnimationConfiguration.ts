import { type SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type Types } from "phaser";

export type AnimationConfiguration = {
  animation: Types.Animations.Animation;
  animations: Types.Animations.Animation[];
  playAnimationKey: SpritesheetKey;
};
