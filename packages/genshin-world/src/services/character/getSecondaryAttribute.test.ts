import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Attribute } from "#src/models/character/Attribute";
import { AttributeGameTextKeyMap } from "#src/services/character/AttributeGameTextKeyMap";
import { getSecondaryAttribute } from "#src/services/character/getSecondaryAttribute";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

// A weapon that grows its base ATK and the one attribute given beside it
const growing = (attribute: Attribute): Pick<WeaponData, "growAttributes"> => ({
  growAttributes: [
    { attribute: Attribute.BaseAttack, base: 42, curve: "weaponAttack" },
    { attribute, base: 0.1, curve: "weaponSecondary" },
  ],
});

describe("getSecondaryAttribute", () => {
  // The attribute a weapon grows beside its base ATK is its secondary, whatever kind it is
  test("a weapon's secondary is the attribute it grows beside its base ATK", () => {
    expect.hasAssertions();

    expect(getSecondaryAttribute(growing(Attribute.ElementalMastery))).toBe(Attribute.ElementalMastery);
  });

  // A weapon that grows nothing beside its base ATK has no secondary, so its row shows nothing
  test("a weapon that grows only its base ATK has no secondary", () => {
    expect.hasAssertions();

    const baseOnly = { growAttributes: [{ attribute: Attribute.BaseAttack, base: 42, curve: "weaponAttack" }] };

    expect(getSecondaryAttribute(baseOnly)).toBeUndefined();
  });

  // The secondary's caption is the game's name for its attribute, and a Defense % has no name, so its caption is absent
  test.each([
    [Attribute.ElementalMastery, GameTextKey.AttributeElementalMastery],
    [Attribute.CriticalRate, GameTextKey.AttributeCriticalRate],
    [Attribute.AttackPercent, GameTextKey.AttributeAttack],
  ])("%s is captioned by the game's %s", (attribute, gameTextKey) => {
    expect.hasAssertions();

    expect(AttributeGameTextKeyMap.get(attribute)).toBe(gameTextKey);
  });

  test("a Defense % has no caption, so the game names none for it", () => {
    expect.hasAssertions();

    expect(AttributeGameTextKeyMap.get(Attribute.DefensePercent)).toBeUndefined();
  });
});
