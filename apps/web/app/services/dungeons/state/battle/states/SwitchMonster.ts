import { StateName } from "@/models/dungeons/state/battle/StateName";
import { createMonsterAppearState } from "@/services/dungeons/state/battle/createMonsterAppearState";

export const SwitchMonster = createMonsterAppearState(StateName.SwitchMonster, StateName.EnemyInput);
