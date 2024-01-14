import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { dayjs } from "@/services/dayjs";
import { type Position } from "grid-engine";
import { Math, type GameObjects, type Scene } from "phaser";

export class HealthBar {
  static FULL_WIDTH = 360;
  static SCALE_Y = 0.7;
  scene: Scene;
  leftCapShadowPhaserImageGameObject: GameObjects.Image;
  middleShadowPhaserImageGameObject: GameObjects.Image;
  rightCapShadowPhaserImageGameObject: GameObjects.Image;
  leftCapPhaserImageGameObject: GameObjects.Image;
  middlePhaserImageGameObject: GameObjects.Image;
  rightCapPhaserImageGameObject: GameObjects.Image;
  phaserContainerGameObject: GameObjects.Container;

  constructor(scene: Scene, position: Position) {
    this.scene = scene;
    const { x, y } = position;
    // Set origin to the middle-left of the health caps to enable
    // grabbing the full width of the game object
    // Create health bar shadows
    this.leftCapShadowPhaserImageGameObject = this.scene.add
      .image(x, y, TextureManagerKey.HealthBarLeftCapShadow)
      .setOrigin(0, 0.5)
      .setScale(1, HealthBar.SCALE_Y);
    this.middleShadowPhaserImageGameObject = this.scene.add
      .image(
        this.leftCapShadowPhaserImageGameObject.x + this.leftCapShadowPhaserImageGameObject.displayWidth,
        y,
        TextureManagerKey.HealthBarMiddleShadow,
      )
      .setOrigin(0, 0.5)
      .setScale(1, HealthBar.SCALE_Y);
    this.middleShadowPhaserImageGameObject.displayWidth = HealthBar.FULL_WIDTH;
    this.rightCapShadowPhaserImageGameObject = this.scene.add
      .image(
        this.middleShadowPhaserImageGameObject.x + this.middleShadowPhaserImageGameObject.displayWidth,
        y,
        TextureManagerKey.HealthBarRightCapShadow,
      )
      .setOrigin(0, 0.5)
      .setScale(1, HealthBar.SCALE_Y);
    // Create health bar
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
      this.leftCapShadowPhaserImageGameObject,
      this.middleShadowPhaserImageGameObject,
      this.rightCapShadowPhaserImageGameObject,
      this.leftCapPhaserImageGameObject,
      this.middlePhaserImageGameObject,
      this.rightCapPhaserImageGameObject,
    ]);
    this.setBarPercentage();
  }

  setBarPercentage(percentage = 100) {
    const displayWidth = HealthBar.FULL_WIDTH * (percentage / 100);
    this.middlePhaserImageGameObject.displayWidth = displayWidth;
    this.rightCapPhaserImageGameObject.setX(
      this.middlePhaserImageGameObject.x + this.middlePhaserImageGameObject.displayWidth,
    );
  }

  setBarPercentageAnimated(
    percentage: number,
    { duration, onComplete }: { duration?: number; onComplete?: () => void } = {},
  ) {
    const displayWidth = HealthBar.FULL_WIDTH * (percentage / 100);
    this.scene.tweens.add({
      targets: this.middlePhaserImageGameObject,
      displayWidth,
      duration: duration || dayjs.duration(1, "second").asMilliseconds(),
      ease: Math.Easing.Sine.Out,
      onUpdate: () => {
        this.rightCapPhaserImageGameObject.setX(
          this.middlePhaserImageGameObject.x + this.middlePhaserImageGameObject.displayWidth,
        );
        const isVisible = this.middlePhaserImageGameObject.displayWidth > 0;
        this.leftCapPhaserImageGameObject.setVisible(isVisible);
        this.middlePhaserImageGameObject.setVisible(isVisible);
        this.rightCapPhaserImageGameObject.setVisible(isVisible);
      },
      onComplete,
    });
  }
}
