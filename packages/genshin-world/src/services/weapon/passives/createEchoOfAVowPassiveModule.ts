import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";
import { takeOne } from "@esposter/shared";

// Echo of a Vow, Echoes of the Heart's passive at its rank: after its wielder causes a reaction, its Elemental Mastery rises by
// The rank's amount for its seconds, whether or not the wielder is on the field. Its Stellar Glimmer reaction DMG clause is not built
export const createEchoOfAVowPassiveModule = (params: number[]): WeaponPassiveModule =>
  createReactionBuffPassiveModule([takeOne(params, 0), takeOne(params, 2), 0], {
    attribute: Attribute.ElementalMastery,
    source: "echoOfAVow",
  });
