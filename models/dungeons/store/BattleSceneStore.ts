import { ActiveBattleMenu } from "@/models/dungeons/battle/UI/menu/ActiveBattleMenu";
import { type EnemyBattleMonster } from "@/models/dungeons/battle/monsters/EnemyBattleMonster";
import { type PlayerBattleMonster } from "@/models/dungeons/battle/monsters/PlayerBattleMonster";

export class BattleSceneStore {
  static activeBattleMenu = ActiveBattleMenu.Main;
  static activePlayerMonster: PlayerBattleMonster;
  static activeEnemyMonster: EnemyBattleMonster;
}
