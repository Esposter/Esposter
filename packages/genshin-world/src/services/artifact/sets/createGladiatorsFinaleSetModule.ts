import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { createWeaponTypeAttackDamageSetModule } from "#src/services/artifact/sets/createWeaponTypeAttackDamageSetModule";
import { takeOne } from "@esposter/shared";

// Gladiator's Finale's four-piece bonus: the Normal Attack DMG its wearer gains while it wields a Sword, a Claymore or
// A Polearm, in the table's only param
export const createGladiatorsFinaleSetModule = ({ params }: ArtifactSetBonus): PassiveModule =>
  createWeaponTypeAttackDamageSetModule({
    amount: takeOne(params, 0),
    attribute: Attribute.NormalAttackDamageBonus,
    weaponTypes: [WeaponType.Sword, WeaponType.Claymore, WeaponType.Polearm],
  });
