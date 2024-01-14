import { BattleMonster } from "@/models/dungeons/battle/monsters/BattleMonster";
import { type BattleMonsterConfiguration } from "@/models/dungeons/battle/monsters/BattleMonsterConfiguration";

export class EnemyBattleMonster extends BattleMonster {
  constructor(battleMonsterConfiguration: Omit<BattleMonsterConfiguration, "healthBarBackgroundImageScaleY">) {
    super({ ...battleMonsterConfiguration, healthBarBackgroundImageScaleY: 0.8 }, { x: 768, y: 144 });
  }
}
