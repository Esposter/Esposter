import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionStellarBuffPassiveModule } from "#src/services/weapon/passives/createReactionStellarBuffPassiveModule";
import { takeOne } from "@esposter/shared";

const STARFIRE_UPON_THE_SNOWPLAINS_SOURCE = "starfireUponTheSnowplains";

// Starfire Upon the Snowplains, Emberwell's passive at its rank: after its wielder causes a reaction, its ATK rises by the rank's
// Percentage for its seconds, and after a Stellar Glimmer reaction the wielder triggers, its Stellar Glimmer reaction DMG rises by
// The rank's percentage for its seconds, whether or not the wielder is on the field
export const createStarfireUponTheSnowplainsPassiveModule = (params: number[]): WeaponPassiveModule =>
  createReactionStellarBuffPassiveModule({
    reactionAmount: takeOne(params, 0),
    reactionAttribute: Attribute.AttackPercent,
    reactionSeconds: takeOne(params, 1),
    source: STARFIRE_UPON_THE_SNOWPLAINS_SOURCE,
    stellarAmount: takeOne(params, 2),
    stellarAttribute: Attribute.StellarGlimmerReactionDamageBonus,
    stellarSeconds: takeOne(params, 3),
  });
