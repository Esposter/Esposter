import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { Types } from "phaser";

export interface AnimationConfiguration {
  animations: Types.Animations.Animation[];
  playAnimationKey: SpritesheetKey | TilesetKey;
}
