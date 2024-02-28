import type { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import type { Types } from "phaser";

export interface AnimationConfiguration {
  animations: Types.Animations.Animation[];
  playAnimationKey: SpritesheetKey;
}
