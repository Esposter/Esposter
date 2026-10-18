import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionStellarBuffPassiveModule } from "#src/services/weapon/passives/createReactionStellarBuffPassiveModule";
import { takeOne } from "@esposter/shared";

const ECHO_OF_A_VOW_SOURCE = "echoOfAVow";

// Echo of a Vow, Echoes of the Heart's passive at its rank: after its wielder causes a reaction, its Elemental Mastery rises by the
// Rank's amount for its seconds, and after a Stellar Glimmer reaction the wielder triggers, its Stellar Glimmer reaction DMG rises by
// The rank's percentage for its seconds, whether or not the wielder is on the field
export const createEchoOfAVowPassiveModule = (params: number[]): WeaponPassiveModule =>
  createReactionStellarBuffPassiveModule({
    reactionAmount: takeOne(params, 0),
    reactionAttribute: Attribute.ElementalMastery,
    reactionSeconds: takeOne(params, 2),
    source: ECHO_OF_A_VOW_SOURCE,
    stellarAmount: takeOne(params, 1),
    stellarAttribute: Attribute.StellarGlimmerReactionDamageBonus,
    stellarSeconds: takeOne(params, 3),
  });
