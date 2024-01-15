import { type Attack } from "@/models/dungeons/attack/Attack";
import { HealthBar } from "@/models/dungeons/battle/UI/HealthBar";
import { type BattleMonsterConfiguration } from "@/models/dungeons/battle/monsters/BattleMonsterConfiguration";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { AttackStore } from "@/models/dungeons/store/AttackStore";
import { type Position } from "grid-engine";
import { type GameObjects, type Scene } from "phaser";

export class BattleMonster {
  protected scene: Scene;
  protected monster: Monster;
  protected monsterAttacks: Attack[];
  protected healthBar: HealthBar;
  protected healthBarContainerPhaserContainerGameObject: GameObjects.Container;
  protected monsterPhaserImageGameObject: GameObjects.Image;

  constructor(battleMonsterConfiguration: BattleMonsterConfiguration, position: Position) {
    this.scene = battleMonsterConfiguration.scene;
    this.monster = battleMonsterConfiguration.monster;
    this.monsterAttacks = this.getMonsterAttacks();
    this.healthBar = new HealthBar(this.scene, { x: 34, y: 34 });
    this.healthBarContainerPhaserContainerGameObject = this.createHealthBarContainer(
      this.healthBar,
      battleMonsterConfiguration.healthBarBackgroundImageScaleY,
    );
    const { x, y } = position;
    this.monsterPhaserImageGameObject = this.scene.add.image(x, y, this.monster.asset.key, this.monster.asset.frame);
  }

  get name() {
    return this.monster.name;
  }

  get baseAttack() {
    return this.monster.stats.baseAttack;
  }

  get level() {
    return this.monster.currentLevel;
  }

  get attacks() {
    return [...this.monsterAttacks];
  }

  get isFainted() {
    return this.monster.currentHp <= 0;
  }

  takeDamage(damage: number, onComplete?: () => void) {
    this.monster.currentHp -= damage;
    if (this.monster.currentHp < 0) this.monster.currentHp = 0;
    this.healthBar.setBarPercentageAnimated((this.monster.currentHp / this.monster.stats.maxHp) * 100, { onComplete });
  }

  createHealthBarContainer(healthBar: HealthBar, scaleY = 1) {
    const healthBarBackgroundImage = this.scene.add
      .image(0, 0, TextureManagerKey.HealthBarBackground)
      .setOrigin(0)
      .setScale(1, scaleY);
    const monsterName = this.scene.add.text(30, 20, TextureManagerKey.Carnodusk, {
      color: "#7e3d3f",
      fontSize: "2rem",
    });
    const monsterLevel = this.scene.add.text(monsterName.displayWidth + 35, 23, `L${this.level}`, {
      color: "#ed474b",
      fontSize: "1.75rem",
    });
    const monsterHp = this.scene.add.text(30, 55, "HP", {
      color: "#ff6505",
      fontSize: "1.5rem",
      fontStyle: "italic",
    });
    return this.scene.add.container(0, 0, [
      healthBarBackgroundImage,
      monsterName,
      healthBar.phaserContainerGameObject,
      monsterLevel,
      monsterHp,
    ]);
  }

  private getMonsterAttacks(): Attack[] {
    const foundAttacks: Attack[] = [];
    for (const attackId of this.monster.attackIds) {
      const foundAttack = AttackStore.getAttack(attackId);
      if (foundAttack) foundAttacks.push(foundAttack);
    }
    return foundAttacks;
  }
}
