import { BattleMonster } from "@/models/dungeons/battle/monsters/BattleMonster";
import { type BattleMonsterConfiguration } from "@/models/dungeons/battle/monsters/BattleMonsterConfiguration";
import { type GameObjects } from "phaser";

export class PlayerBattleMonster extends BattleMonster {
  healthBarPhaserTextGameObject: GameObjects.Text;

  constructor(battleMonsterConfiguration: Omit<BattleMonsterConfiguration, "healthBarBackgroundImageScaleY">) {
    super({ ...battleMonsterConfiguration }, { x: 256, y: 316 });
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
    super.takeDamage(damage, onComplete);
    this.setHealthBarText();
  }
}
