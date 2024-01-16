import { SceneWithPlugins } from "@/models/dungeons/SceneWithPlugins";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { Background } from "@/models/dungeons/battle/UI/Background";
import { BattleMenu } from "@/models/dungeons/battle/UI/menu/BattleMenu";
import { EnemyBattleMonster } from "@/models/dungeons/battle/monsters/EnemyBattleMonster";
import { PlayerBattleMonster } from "@/models/dungeons/battle/monsters/PlayerBattleMonster";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { StateMachine } from "@/models/dungeons/state/StateMachine";
import { StateName } from "@/models/dungeons/state/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { dayjs } from "@/services/dayjs";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { Input, type Types } from "phaser";

export class BattleScene extends SceneWithPlugins {
  cursorKeys!: Types.Input.Keyboard.CursorKeys;
  background!: Background;
  activePlayerMonster!: PlayerBattleMonster;
  activeEnemyMonster!: EnemyBattleMonster;
  battleMenu!: BattleMenu;
  battleStateMachine!: StateMachine<this>;

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
        attackIds: [AttackId.Slash],
      },
    });
    BattleSceneStore.activePlayerMonster = this.activePlayerMonster;
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
        attackIds: [AttackId.IceShard],
      },
    });
    BattleSceneStore.activeEnemyMonster = this.activeEnemyMonster;
    this.battleMenu = new BattleMenu(this);
    this.battleMenu.showPlayerBattleMenu();
    this.battleStateMachine = new StateMachine(this);
    this.battleStateMachine.addState({
      name: StateName.Intro,
      onEnter: () => {
        this.time.delayedCall(dayjs.duration(1, "second").asMilliseconds(), () => {
          this.battleStateMachine.setState(StateName.Battle);
        });
      },
    });
    this.battleStateMachine.addState({
      name: StateName.Battle,
    });
  }

  update() {
    if (Input.Keyboard.JustDown(this.cursorKeys.space)) this.battleMenu.onPlayerInput(PlayerSpecialInput.Confirm);
    else if (Input.Keyboard.JustDown(this.cursorKeys.shift)) this.battleMenu.onPlayerInput(PlayerSpecialInput.Cancel);
    else this.battleMenu.onPlayerInput(mapCursorKeysToDirection(this.cursorKeys));
  }
}
