import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Position } from "grid-engine";
import { type GameObjects, type Scene } from "phaser";

export class HealthBar {
  static FULL_WIDTH = 360;
  static SCALE_Y = 0.7;
  scene: Scene;
  leftCapPhaserImageGameObject: GameObjects.Image;
  middlePhaserImageGameObject: GameObjects.Image;
  rightCapPhaserImageGameObject: GameObjects.Image;
  phaserContainerGameObject: GameObjects.Container;

  constructor(scene: Scene, position: Position) {
    this.scene = scene;
    const { x, y } = position;
    // Set origin to the middle-left of the health caps to enable
    // grabbing the full width of the game object
    this.leftCapPhaserImageGameObject = this.scene.add
      .image(x, y, TextureManagerKey.HealthBarLeftCap)
      .setOrigin(0, 0.5)
      .setScale(1, HealthBar.SCALE_Y);
    this.middlePhaserImageGameObject = this.scene.add
      .image(
        this.leftCapPhaserImageGameObject.x + this.leftCapPhaserImageGameObject.displayWidth,
        y,
        TextureManagerKey.HealthBarMiddle,
      )
      .setOrigin(0, 0.5)
      .setScale(1, HealthBar.SCALE_Y);
    this.rightCapPhaserImageGameObject = this.scene.add
      .image(
        this.middlePhaserImageGameObject.x + this.middlePhaserImageGameObject.displayWidth,
        y,
        TextureManagerKey.HealthBarRightCap,
      )
      .setOrigin(0, 0.5)
      .setScale(1, HealthBar.SCALE_Y);
    this.phaserContainerGameObject = this.scene.add.container(x, y, [
      this.leftCapPhaserImageGameObject,
      this.middlePhaserImageGameObject,
      this.rightCapPhaserImageGameObject,
    ]);
    this.setBarPercentage();
  }

  setBarPercentage(percentage = 100) {
    const width = HealthBar.FULL_WIDTH * (percentage / 100);
    this.middlePhaserImageGameObject.displayWidth = width;
    this.rightCapPhaserImageGameObject.setX(
      this.middlePhaserImageGameObject.x + this.middlePhaserImageGameObject.displayWidth,
    );
  }
}
