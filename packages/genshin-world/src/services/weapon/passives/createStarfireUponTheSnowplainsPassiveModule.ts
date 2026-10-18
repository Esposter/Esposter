import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";
import { takeOne } from "@esposter/shared";

// Starfire Upon the Snowplains, Emberwell's passive at its rank: after its wielder causes a reaction, its ATK rises by the rank's
// Percentage for its seconds, whether or not the wielder is on the field. Its Stellar Glimmer reaction DMG clause is not built
export const createStarfireUponTheSnowplainsPassiveModule = (params: number[]): WeaponPassiveModule =>
  createReactionBuffPassiveModule([takeOne(params, 0), takeOne(params, 1), 0], {
    attribute: Attribute.AttackPercent,
    source: "starfireUponTheSnowplains",
  });
