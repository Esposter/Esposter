import { StateName } from "@/models/dungeons/state/battle/StateName";
import { createMonsterAppearState } from "@/services/dungeons/state/battle/createMonsterAppearState";

export const BringOutMonster = createMonsterAppearState(StateName.BringOutMonster, StateName.PlayerInput);
