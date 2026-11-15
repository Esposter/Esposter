import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { createMonsterAppearState } from "#src/services/dungeons/state/battle/createMonsterAppearState";

export const BringOutMonster = createMonsterAppearState(StateName.BringOutMonster, StateName.PlayerInput);
