import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { dayjs } from "@/services/dayjs";
import { INITIAL_PLAYER_INPUT_CURSOR_POSITION } from "@/services/dungeons/battle/UI/menu/constants";
import { type GameObjects, type Scene, type Tweens } from "phaser";

export class UserInputCursor {
  scene: Scene;
  battleLine1PhaserTextGameObject: GameObjects.Text;
  phaserImageGameObject: GameObjects.Image;
  phaserTween: Tweens.Tween;

  constructor(scene: Scene, battleLine1PhaserTextGameObject: GameObjects.Text) {
    this.scene = scene;
    this.battleLine1PhaserTextGameObject = battleLine1PhaserTextGameObject;
    this.phaserImageGameObject = this.scene.add.image(0, 0, TextureManagerKey.Cursor).setAngle(90).setScale(2.5, 1.25);
    this.phaserTween = this.scene.add.tween({
      targets: this.phaserImageGameObject,
      delay: 0,
      duration: dayjs.duration(0.5, "seconds").asMilliseconds(),
      repeat: -1,
      y: {
        from: INITIAL_PLAYER_INPUT_CURSOR_POSITION.y,
        start: INITIAL_PLAYER_INPUT_CURSOR_POSITION.y,
        to: INITIAL_PLAYER_INPUT_CURSOR_POSITION.y + 6,
      },
    });
    this.hide();
  }

  playAnimation() {
    this.phaserImageGameObject
      .setPosition(
        this.battleLine1PhaserTextGameObject.displayWidth + this.phaserImageGameObject.displayWidth * 2.7,
        this.phaserImageGameObject.y,
      )
      .setVisible(true);
    this.phaserTween.restart();
  }

  hide() {
    this.phaserImageGameObject.setVisible(false);
    this.phaserTween.pause();
  }
}
