import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { createWeaponTypeAttackDamageSetModule } from "#src/services/artifact/sets/createWeaponTypeAttackDamageSetModule";
import { takeOne } from "@esposter/shared";

// Wanderer's Troupe's four-piece bonus: the Charged Attack DMG its wearer gains while it wields a Bow or a Catalyst,
// In the table's only param
export const createWanderersTroupeSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule =>
  createWeaponTypeAttackDamageSetModule({
    amount: takeOne(params, 0),
    attribute: Attribute.ChargedAttackDamageBonus,
    weaponTypes: [WeaponType.Bow, WeaponType.Catalyst],
  });
