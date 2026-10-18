import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { createChanceProcPassiveModule } from "#src/services/weapon/passives/createChanceProcPassiveModule";
import { takeOne } from "@esposter/shared";

const BLACK_WING_COOLDOWN_ID = "blackWing";
const BLACK_WING_COOLDOWN_SECONDS = 2;

// Skyward Spine's Black Wing at its rank: its wielder's CRIT Rate and Normal Attack SPD are raised by the rank's two
// Percentages. A Normal or Charged Attack hit has the rank's chance to queue a vacuum blade of the rank's ATK share in a small AoE,
// Once every two seconds, which is the text's and not the parameter list's
export const createBlackWingPassiveModule = (params: number[]): PassiveModule => ({
  getPassiveBonuses: () => [
    { amount: takeOne(params, 0), attribute: Attribute.CriticalRate },
    { amount: takeOne(params, 1), attribute: Attribute.NormalAttackSpeed },
  ],
  ...createChanceProcPassiveModule({
    chance: takeOne(params, 2),
    checkIsProcAttack: checkIsNormalOrChargedAttack,
    cooldownId: BLACK_WING_COOLDOWN_ID,
    cooldownSeconds: BLACK_WING_COOLDOWN_SECONDS,
    talentMultiplier: takeOne(params, 3),
  }),
});
