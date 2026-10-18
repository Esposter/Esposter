import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionStellarBuffPassiveModule } from "#src/services/weapon/passives/createReactionStellarBuffPassiveModule";
import { takeOne } from "@esposter/shared";

const REPENTANCE_AND_REDEMPTION_SOURCE = "repentanceAndRedemption";

// Repentance and Redemption, Blade of Atonement's passive at its rank: after its wielder triggers an Elemental Reaction, its
// Elemental Mastery rises by the rank's amount for the rank's seconds, and after a Stellar Glimmer reaction its ATK rises by
// The rank's percentage for the rank's seconds, whether or not the wielder is on the field
export const createRepentanceAndRedemptionPassiveModule = (params: number[]): WeaponPassiveModule =>
  createReactionStellarBuffPassiveModule({
    reactionAmount: takeOne(params, 0),
    reactionAttribute: Attribute.ElementalMastery,
    reactionSeconds: takeOne(params, 1),
    source: REPENTANCE_AND_REDEMPTION_SOURCE,
    stellarAmount: takeOne(params, 2),
    stellarAttribute: Attribute.AttackPercent,
    stellarSeconds: takeOne(params, 3),
  });
