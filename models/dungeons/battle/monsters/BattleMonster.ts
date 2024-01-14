import { HealthBar } from "@/models/dungeons/battle/UI/HealthBar";
import { type BattleMonsterConfiguration } from "@/models/dungeons/battle/monsters/BattleMonsterConfiguration";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { type Position } from "grid-engine";
import { type GameObjects, type Scene } from "phaser";

export class BattleMonster {
  protected scene: Scene;
  protected monster: Monster;
  protected healthBar: HealthBar;
  protected phaserImageGameObject: GameObjects.Image;

  constructor(battleMonsterConfiguration: BattleMonsterConfiguration, position: Position) {
    this.scene = battleMonsterConfiguration.scene;
    this.monster = battleMonsterConfiguration.monster;
    this.healthBar = new HealthBar(this.scene, { x: 34, y: 34 });
    const { x, y } = position;
    this.phaserImageGameObject = this.scene.add.image(x, y, this.monster.asset.key, this.monster.asset.frame);
  }

  get name() {
    return this.monster.name;
  }

  get isFainted() {
    return this.monster.currentHp <= 0;
  }

  get attacks() {
    return [...this.monster.attacks];
  }

  get baseAttack() {
    return this.monster.stats.baseAttack;
  }

  takeDamage(damage: number, onComplete?: () => void) {
    this.monster.currentHp -= damage;
    if (this.monster.currentHp < 0) this.monster.currentHp = 0;
    this.healthBar.setBarPercentageAnimated((this.monster.currentHp / this.monster.stats.maxHp) * 100, { onComplete });
  }
}
