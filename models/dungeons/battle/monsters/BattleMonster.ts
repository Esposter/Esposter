import { HealthBar } from "@/models/dungeons/battle/UI/HealthBar";
import { type BattleMonsterConfiguration } from "@/models/dungeons/battle/monsters/BattleMonsterConfiguration";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { type Position } from "grid-engine";
import { type GameObjects, type Scene } from "phaser";

export class BattleMonster {
  scene: Scene;
  phaserImageGameObject: GameObjects.Image;
  protected monster: Monster;
  protected healthBar: HealthBar;

  constructor(battleMonsterConfiguration: BattleMonsterConfiguration, position: Position) {
    this.scene = battleMonsterConfiguration.scene;
    this.monster = battleMonsterConfiguration.monster;
    this.healthBar = new HealthBar(this.scene, { x: 34, y: 34 });
    const { x, y } = position;
    this.phaserImageGameObject = this.scene.add.image(x, y, this.monster.asset.key, this.monster.asset.frame);
  }
}
