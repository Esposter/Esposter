import { AttackId } from "@/models/dungeons/attack/AttackId";
import { Background } from "@/models/dungeons/battle/UI/Background";
import { BattleMenu } from "@/models/dungeons/battle/UI/menu/BattleMenu";
import { EnemyBattleMonster } from "@/models/dungeons/battle/monsters/EnemyBattleMonster";
import { PlayerBattleMonster } from "@/models/dungeons/battle/monsters/PlayerBattleMonster";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
import { StateMachine } from "@/models/dungeons/state/StateMachine";
import { StateMap } from "@/models/dungeons/state/battle/StateMap";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { type Types } from "phaser";

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
    this.activePlayerMonster = this.createActivePlayerMonster();
    BattleSceneStore.activePlayerMonster = this.activePlayerMonster;
    this.activeEnemyMonster = this.createActiveEnemyMonster();
    BattleSceneStore.activeEnemyMonster = this.activeEnemyMonster;
    this.battleMenu = new BattleMenu(this);
    BattleSceneStore.battleStateMachine = new StateMachine<BattleScene, StateName>(this, StateMap);
    BattleSceneStore.battleStateMachine.setState(StateName.Intro);
  }

  update() {
    BattleSceneStore.battleStateMachine.update();
    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.space))
      this.battleMenu.onPlayerInput(PlayerSpecialInput.Confirm);
    else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.shift))
      this.battleMenu.onPlayerInput(PlayerSpecialInput.Cancel);
    else this.battleMenu.onPlayerInput(mapCursorKeysToDirection(this.cursorKeys));
  }

  createActivePlayerMonster() {
    return new PlayerBattleMonster({
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
        attackIds: [AttackId.Slash],
      },
    });
  }

  createActiveEnemyMonster() {
    return new EnemyBattleMonster({
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
        attackIds: [AttackId.IceShard],
      },
    });
  }
}
