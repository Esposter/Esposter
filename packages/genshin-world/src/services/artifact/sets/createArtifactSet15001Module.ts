import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { createWeaponTypeAttackDamageSetModule } from "#src/services/artifact/sets/createWeaponTypeAttackDamageSetModule";
import { takeOne } from "@esposter/shared";

// The set table's id 15001's four-piece bonus: the Normal Attack DMG its wearer gains while it wields a Sword, a Claymore or
// A Polearm, in the table's only param
export const createArtifactSet15001Module = ({ params }: ArtifactSetBonus): ArtifactSetModule =>
  createWeaponTypeAttackDamageSetModule({
    amount: takeOne(params, 0),
    attribute: Attribute.NormalAttackDamageBonus,
    weaponTypes: [WeaponType.Sword, WeaponType.Claymore, WeaponType.Polearm],
  });
