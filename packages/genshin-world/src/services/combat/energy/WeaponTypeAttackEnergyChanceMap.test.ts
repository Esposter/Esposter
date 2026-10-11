import { WeaponType } from "#src/models/weapon/WeaponType";
import { WeaponTypeAttackEnergyChanceMap } from "#src/services/combat/energy/WeaponTypeAttackEnergyChanceMap";
import { describe, expect, test } from "vitest";

describe("weaponTypeAttackEnergyChanceMap", () => {
  test.each<[WeaponType, number]>([
    [WeaponType.Sword, 4.52],
    [WeaponType.Bow, 6.29],
    [WeaponType.Claymore, 4.66],
    [WeaponType.Polearm, 6.95],
    [WeaponType.Catalyst, 4.66],
  ])("takes a %s the wiki's average of %d hits to give energy", (weaponType, averageHitCount) => {
    expect.hasAssertions();

    const { base, increase } = WeaponTypeAttackEnergyChanceMap[weaponType];
    let expectedHitCount = 0;
    let missChance = 1;
    for (let missCount = 0; missChance > 0; missCount += 1) {
      expectedHitCount += missChance;
      missChance *= 1 - Math.min(1, base + increase * missCount);
    }

    expect(expectedHitCount).toBeCloseTo(averageHitCount, 2);
  });
});
