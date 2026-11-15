import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { createMonsterAppearState } from "#src/services/dungeons/state/battle/createMonsterAppearState";

export const SwitchMonster = createMonsterAppearState(StateName.SwitchMonster, StateName.EnemyInput);
