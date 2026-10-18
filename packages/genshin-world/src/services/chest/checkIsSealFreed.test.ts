import type { KitHit } from "#src/models/kit/KitHit";

import { ChestSeal } from "#src/models/chest/ChestSeal";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { checkIsSealFreed } from "#src/services/chest/checkIsSealFreed";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { describe, expect, test } from "vitest";

describe(checkIsSealFreed, () => {
  const combatant = { characterId: TRAVELER_CHARACTER_ID, weaponType: WeaponType.Sword };
  const hit: KitHit = {
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkSeconds: 0,
    poiseDamage: 0,
    talentMultiplier: 1,
  };

  test("a chest sealed in vines is freed by Pyro", () => {
    expect.hasAssertions();

    expect(checkIsSealFreed(ChestSeal.Vines, combatant, { ...hit, element: Element.Pyro })).toBe(true);
  });

  test("a chest sealed in rock is freed by a blunt attack", () => {
    expect.hasAssertions();

    expect(
      checkIsSealFreed(
        ChestSeal.Rock,
        { ...combatant, weaponType: WeaponType.Claymore },
        { ...hit, actionAttackTag: AttackTag.NormalAttack },
      ),
    ).toBe(true);
  });

  test("a chest sealed in rock is freed by a strike that deals poise damage", () => {
    expect.hasAssertions();

    expect(checkIsSealFreed(ChestSeal.Rock, combatant, { ...hit, poiseDamage: 1 })).toBe(true);
  });

  test("a chest sealed in rock is not freed by a physical attack with no poise", () => {
    expect.hasAssertions();

    expect(checkIsSealFreed(ChestSeal.Rock, combatant, { ...hit, actionAttackTag: AttackTag.NormalAttack })).toBe(
      false,
    );
  });

  test("a chest sealed in vines is not freed by an attack of another element", () => {
    expect.hasAssertions();

    expect(checkIsSealFreed(ChestSeal.Vines, combatant, { ...hit, element: Element.Hydro })).toBe(false);
  });
});
