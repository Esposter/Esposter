import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { type EnemyBattleMonster } from "@/models/dungeons/battle/monsters/EnemyBattleMonster";
import { type PlayerBattleMonster } from "@/models/dungeons/battle/monsters/PlayerBattleMonster";
import { type BattleScene } from "@/models/dungeons/scenes/BattleScene";
import { type StateMachine } from "@/models/dungeons/state/StateMachine";
import { type StateName } from "@/models/dungeons/state/battle/StateName";

export class BattleSceneStore {
  static activeBattleMenu = ActiveBattleMenu.Main;
  static activePlayerMonster: PlayerBattleMonster;
  static activeEnemyMonster: EnemyBattleMonster;
  static battleStateMachine: StateMachine<BattleScene, StateName>;
}
