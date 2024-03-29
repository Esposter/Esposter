import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { Types } from "phaser";

export interface AnimationConfiguration {
  animations: Types.Animations.Animation[];
  playAnimationKey: SpritesheetKey;
}
