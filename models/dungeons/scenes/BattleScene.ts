import { SceneWithPlugins } from "@/models/dungeons/SceneWithPlugins";
import { Background } from "@/models/dungeons/battle/UI/Background";
import { BattleMenu } from "@/models/dungeons/battle/UI/menu/BattleMenu";
import { EnemyBattleMonster } from "@/models/dungeons/battle/monsters/EnemyBattleMonster";
import { PlayerBattleMonster } from "@/models/dungeons/battle/monsters/PlayerBattleMonster";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { mapCursorKeysToDirection } from "@/services/dungeons/mapCursorKeysToDirection";
import { Input, type Types } from "phaser";

export class BattleScene extends SceneWithPlugins {
  cursorKeys!: Types.Input.Keyboard.CursorKeys;
  background!: Background;
  activePlayerMonster!: PlayerBattleMonster;
  activeEnemyMonster!: EnemyBattleMonster;
  battleMenu!: BattleMenu;

  constructor() {
    super(SceneKey.Battle);
  }

  create() {
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.background = new Background(this);
    this.background.showForest();
    this.activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monster: {
        name: TextureManagerKey.Iguanignite,
        asset: {
          key: TextureManagerKey.Iguanignite,
        },
        stats: {
          maxHp: 25,
          baseAttack: 5,
        },
        currentLevel: 5,
        currentHp: 25,
        attacks: [],
      },
    });
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
        currentLevel: 5,
        currentHp: 25,
        attacks: [],
      },
    });
    this.battleMenu = new BattleMenu(this);
    this.battleMenu.showPlayerBattleMenu();
  }

  update() {
    if (Input.Keyboard.JustDown(this.cursorKeys.space)) this.battleMenu.onPlayerInput(PlayerSpecialInput.Confirm);
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) this.battleMenu.onPlayerInput(PlayerSpecialInput.Cancel);
    else this.battleMenu.onPlayerInput(mapCursorKeysToDirection(this.cursorKeys));
  }
}
