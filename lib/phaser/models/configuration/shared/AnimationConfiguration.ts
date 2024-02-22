import type { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import type { Types } from "phaser";

export type AnimationConfiguration = {
  animations: Types.Animations.Animation[];
  playAnimationKey: SpritesheetKey;
};
