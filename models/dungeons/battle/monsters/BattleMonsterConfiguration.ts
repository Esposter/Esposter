import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { type Scene } from "phaser";

export interface BattleMonsterConfiguration {
  scene: Scene;
  monster: Monster;
  // By default, this will be 1
  healthBarBackgroundImageScaleY?: number;
}
