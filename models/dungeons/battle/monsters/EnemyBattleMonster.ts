import { BattleMonster } from "@/models/dungeons/battle/monsters/BattleMonster";
import { type BattleMonsterConfiguration } from "@/models/dungeons/battle/monsters/BattleMonsterConfiguration";

export class EnemyBattleMonster extends BattleMonster {
  constructor(battleMonsterConfiguration: BattleMonsterConfiguration) {
    super(battleMonsterConfiguration, { x: 768, y: 144 });
  }
}
