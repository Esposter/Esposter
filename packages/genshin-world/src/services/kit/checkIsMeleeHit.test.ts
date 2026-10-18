import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { checkIsMeleeHit } from "#src/services/kit/checkIsMeleeHit";
import { describe, expect, test } from "vitest";

describe(checkIsMeleeHit, () => {
  const hit: KitHit = {
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkSeconds: 0,
    poiseDamage: 1,
    talentMultiplier: 1,
  };

  test.each<[AttackTag | undefined, WeaponType, boolean]>([
    [AttackTag.NormalAttack, WeaponType.Sword, true],
    [AttackTag.ChargedAttack, WeaponType.Claymore, true],
    [AttackTag.PlungingAttack, WeaponType.Sword, false],
    [AttackTag.NormalAttack, WeaponType.Bow, false],
    [undefined, WeaponType.Polearm, false],
  ])("reads a hit in a %s action of a %s wielder as melee: %s", (actionAttackTag, weaponType, isMelee) => {
    expect.hasAssertions();

    // The kind the hit is dealt as is not the one read: a normal attack's hit dealt as a skill's is still melee
    expect(checkIsMeleeHit({ weaponType }, { ...hit, actionAttackTag, attackTag: AttackTag.ElementalSkill })).toBe(
      isMelee,
    );
  });
});
