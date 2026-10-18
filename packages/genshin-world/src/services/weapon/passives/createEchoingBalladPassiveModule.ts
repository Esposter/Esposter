import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createChanceProcPassiveModule } from "#src/services/weapon/passives/createChanceProcPassiveModule";
import { takeOne } from "@esposter/shared";

const ECHOING_BALLAD_COOLDOWN_ID = "echoingBallad";

// Skyward Harp's Echoing Ballad at its rank: its wielder's CRIT DMG is raised by the rank's percentage. A hit of the wielder's
// Own attack has the rank's chance to queue a Physical small AoE at the rank's multiplier of ATK, once every rank's cooldown in seconds.
// A passive's own queued hit has no attack tag, so it queues nothing
export const createEchoingBalladPassiveModule = (params: number[]): PassiveModule => ({
  getPassiveBonuses: () => [{ amount: takeOne(params, 0), attribute: Attribute.CriticalDamage }],
  ...createChanceProcPassiveModule({
    chance: takeOne(params, 1),
    checkIsProcAttack: (attackTag) => attackTag !== undefined,
    cooldownId: ECHOING_BALLAD_COOLDOWN_ID,
    cooldownSeconds: takeOne(params, 3),
    talentMultiplier: takeOne(params, 2),
  }),
});
