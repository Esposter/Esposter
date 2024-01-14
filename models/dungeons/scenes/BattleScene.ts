import { SceneWithPlugins } from "@/models/dungeons/SceneWithPlugins";
import { Background } from "@/models/dungeons/battle/UI/Background";
import { HealthBar } from "@/models/dungeons/battle/UI/HealthBar";
import { BattleMenu } from "@/models/dungeons/battle/UI/menu/BattleMenu";
import { EnemyBattleMonster } from "@/models/dungeons/battle/monsters/EnemyBattleMonster";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { mapCursorKeysToDirection } from "@/services/dungeons/mapCursorKeysToDirection";
import { Input, type Types } from "phaser";

export class BattleScene extends SceneWithPlugins {
  cursorKeys!: Types.Input.Keyboard.CursorKeys;
  background!: Background;
  playerHealthBar!: HealthBar;
  activeEnemyMonster!: EnemyBattleMonster;
  battleMenu!: BattleMenu;

  constructor() {
    super(SceneKey.Battle);
  }

  create() {
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.background = new Background(this);
    this.background.showForest();
    this.activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
      monster: {
        name: TextureManagerKey.Carnodusk,
        asset: {
          key: TextureManagerKey.Carnodusk,
        },
        stats: {
          maxHp: 25,
          baseAttack: 5,
        },
        currentHp: 25,
        attacks: [],
      },
    });
    this.playerHealthBar = new HealthBar(this, { x: 34, y: 34 });
    // Player and enemy monsters
    this.add.image(768, 144, TextureManagerKey.Carnodusk);
    this.add.image(256, 316, TextureManagerKey.Iguanignite).setFlipX(true);

    const playerMonsterName = this.add.text(30, 20, TextureManagerKey.Iguanignite, {
      color: "#7e3d3f",
      fontSize: "2rem",
    });
    this.add.container(556, 318, [
      this.add.image(0, 0, TextureManagerKey.HealthBarBackground).setOrigin(0),
      playerMonsterName,
      this.playerHealthBar.phaserContainerGameObject,
      this.add.text(playerMonsterName.displayWidth + 35, 23, "L5", {
        color: "#ed474b",
        fontSize: "1.75rem",
      }),
      this.add.text(30, 55, "HP", {
        color: "#ff6505",
        fontSize: "1.5rem",
        fontStyle: "italic",
      }),
      this.add
        .text(443, 80, "25/25", {
          color: "#7e3d3f",
          fontSize: "1rem",
        })
        .setOrigin(1, 0),
    ]);

    const enemyMonsterName = this.add.text(30, 20, TextureManagerKey.Carnodusk, {
      color: "#7e3d3f",
      fontSize: "2rem",
    });
    this.add.container(0, 0, [
      this.add.image(0, 0, TextureManagerKey.HealthBarBackground).setOrigin(0).setScale(1, 0.8),
      enemyMonsterName,
      this.activeEnemyMonster.healthBar.phaserContainerGameObject,
      this.add.text(enemyMonsterName.displayWidth + 35, 23, "L5", {
        color: "#ed474b",
        fontSize: "1.75rem",
      }),
      this.add.text(30, 55, "HP", {
        color: "#ff6505",
        fontSize: "1.5rem",
        fontStyle: "italic",
      }),
    ]);

    this.battleMenu = new BattleMenu(this);
    this.battleMenu.showPlayerBattleMenu();
  }

  update() {
    if (Input.Keyboard.JustDown(this.cursorKeys.space)) this.battleMenu.onPlayerInput(PlayerSpecialInput.Confirm);
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) this.battleMenu.onPlayerInput(PlayerSpecialInput.Cancel);
    else this.battleMenu.onPlayerInput(mapCursorKeysToDirection(this.cursorKeys));
  }
}
