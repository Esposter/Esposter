import { BattleMonster } from "@/models/dungeons/battle/monsters/BattleMonster";
import { type BattleMonsterConfiguration } from "@/models/dungeons/battle/monsters/BattleMonsterConfiguration";
import { dayjs } from "@/services/dayjs";
import { type Position } from "grid-engine";

export class EnemyBattleMonster extends BattleMonster {
  static INITIAL_POSITION: Position = { x: 768, y: 144 };

  constructor(battleMonsterConfiguration: Omit<BattleMonsterConfiguration, "healthBarBackgroundImageScaleY">) {
    super({ ...battleMonsterConfiguration, healthBarBackgroundImageScaleY: 0.8 }, EnemyBattleMonster.INITIAL_POSITION);
  }

  takeDamage(damage: number, onComplete?: () => void): void {
    this.playTakeDamageAnimation(() => {
      super.takeDamage(damage, onComplete);
    });
  }

  playMonsterAppearAnimation(onComplete?: () => void) {
    const xStartPosition = -30;
    const xEndPosition = this.monsterPhaserImageGameObject.x;
    this.monsterPhaserImageGameObject.setPosition(xStartPosition, this.monsterPhaserImageGameObject.y).setVisible(true);
    this.scene.tweens.add({
      targets: this.monsterPhaserImageGameObject,
      delay: 0,
      duration: dayjs.duration(1.6, "seconds").asMilliseconds(),
      x: {
        from: xStartPosition,
        start: xStartPosition,
        to: xEndPosition,
      },
      onComplete,
    });
  }

  playHealthBarAppearAnimation(onComplete?: () => void) {
    const xStartPosition = -600;
    const xEndPosition = this.healthBarContainerPhaserContainerGameObject.x;
    this.healthBarContainerPhaserContainerGameObject
      .setPosition(xStartPosition, this.healthBarContainerPhaserContainerGameObject.y)
      .setVisible(true);
    this.scene.tweens.add({
      targets: this.healthBarContainerPhaserContainerGameObject,
      delay: 0,
      duration: dayjs.duration(1.5, "seconds").asMilliseconds(),
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
    const yEndPosition = yStartPosition - 400;
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
