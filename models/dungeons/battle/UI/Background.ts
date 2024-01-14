import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type GameObjects, type Scene } from "phaser";

export class Background {
  scene: Scene;
  phaserImageGameObject: GameObjects.Image;

  constructor(scene: Scene) {
    this.scene = scene;
    this.phaserImageGameObject = this.scene.add
      .image(0, 0, TextureManagerKey.ForestBackground)
      .setOrigin(0)
      .setVisible(false);
  }

  showForest() {
    this.phaserImageGameObject.setTexture(TextureManagerKey.ForestBackground).setVisible(true);
  }
}
