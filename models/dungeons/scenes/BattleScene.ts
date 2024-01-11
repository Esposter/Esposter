import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { Scene } from "phaser";

export class BattleScene extends Scene {
  constructor() {
    super(SceneKey.Battle);
  }

  create() {
    this.add.image(0, 0, TextureManagerKey.ForestBackground).setOrigin(0);
    this.add.image(768, 144, TextureManagerKey.Carnodusk, 0);
    this.add.image(256, 316, TextureManagerKey.Iguanignite, 0).setFlipX(true);
  }
}
