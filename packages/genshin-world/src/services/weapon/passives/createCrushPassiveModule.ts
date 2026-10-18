import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { createChanceProcPassiveModule } from "#src/services/weapon/passives/createChanceProcPassiveModule";
import { takeOne } from "@esposter/shared";

const CRUSH_COOLDOWN_ID = "crush";
const CRUSH_COOLDOWN_SECONDS = 15;

// Crush at its rank: each normal or charged attack hit has the rank's chance of an extra hit at the rank's multiplier of
// ATK, on the area, and a proc holds off the next for fifteen seconds
export const createCrushPassiveModule = (params: number[]): PassiveModule =>
  createChanceProcPassiveModule({
    chance: takeOne(params, 0),
    checkIsProcAttack: checkIsNormalOrChargedAttack,
    cooldownId: CRUSH_COOLDOWN_ID,
    cooldownSeconds: CRUSH_COOLDOWN_SECONDS,
    talentMultiplier: takeOne(params, 1),
  });
