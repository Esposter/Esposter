import { BattleMonster } from "@/models/dungeons/battle/monsters/BattleMonster";
import { type BattleMonsterConfiguration } from "@/models/dungeons/battle/monsters/BattleMonsterConfiguration";
import { dayjs } from "@/services/dayjs";
import { type Position } from "grid-engine";
import { type GameObjects } from "phaser";

export class PlayerBattleMonster extends BattleMonster {
  static INITIAL_POSITION: Position = { x: 256, y: 316 };
  healthBarPhaserTextGameObject: GameObjects.Text;

  constructor(battleMonsterConfiguration: Omit<BattleMonsterConfiguration, "healthBarBackgroundImageScaleY">) {
    super({ ...battleMonsterConfiguration }, PlayerBattleMonster.INITIAL_POSITION);
    this.healthBarPhaserTextGameObject = this.scene.add
      .text(443, 80, "", {
        color: "#7e3d3f",
        fontSize: "1rem",
      })
      .setOrigin(1, 0);
    this.setHealthBarText();
    this.healthBarContainerPhaserContainerGameObject.setPosition(556, 318);
    this.healthBarContainerPhaserContainerGameObject.add(this.healthBarPhaserTextGameObject);
    this.monsterPhaserImageGameObject.setFlipX(true);
  }

  setHealthBarText() {
    this.healthBarPhaserTextGameObject.setText(`${this.monster.currentHp}/${this.monster.stats.maxHp}`);
  }

  takeDamage(damage: number, onComplete?: () => void) {
    this.playTakeDamageAnimation(() => {
      super.takeDamage(damage, onComplete);
      this.setHealthBarText();
    });
  }

  playMonsterAppearAnimation(onComplete?: () => void) {
    const xStartPosition = -30;
    const xEndPosition = this.monsterPhaserImageGameObject.x;
    this.monsterPhaserImageGameObject.setPosition(xStartPosition, this.monsterPhaserImageGameObject.y).setVisible(true);
    this.scene.tweens.add({
      targets: this.monsterPhaserImageGameObject,
      delay: 0,
      duration: dayjs.duration(0.8, "seconds").asMilliseconds(),
      x: {
        from: xStartPosition,
        start: xStartPosition,
        to: xEndPosition,
      },
      onComplete,
    });
  }

  playHealthBarAppearAnimation(onComplete?: () => void) {
    const xStartPosition = 800;
    const xEndPosition = this.healthBarContainerPhaserContainerGameObject.x;
    this.healthBarContainerPhaserContainerGameObject
      .setPosition(xStartPosition, this.healthBarContainerPhaserContainerGameObject.y)
      .setVisible(true);
    this.scene.tweens.add({
      targets: this.healthBarContainerPhaserContainerGameObject,
      delay: 0,
      duration: dayjs.duration(0.8, "seconds").asMilliseconds(),
      x: {
        from: xStartPosition,
        start: xStartPosition,
        to: xEndPosition,
      },
      onComplete,
    });
  }

  playDeathAnimation(onComplete?: () => void) {
    const yStartPosition = this.monsterPhaserImageGameObject.y;
    const yEndPosition = yStartPosition + 400;
    this.scene.tweens.add({
      targets: this.monsterPhaserImageGameObject,
      delay: 0,
      duration: dayjs.duration(2, "seconds").asMilliseconds(),
      y: {
        from: yStartPosition,
        start: yStartPosition,
        to: yEndPosition,
      },
      onComplete,
    });
  }
}
