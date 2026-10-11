import { WeaponType } from "#src/models/weapon/WeaponType";
import { createKitState } from "#src/services/kit/createKitState";
import { rollKitAttackEnergy } from "#src/services/kit/rollKitAttackEnergy";
import { describe, expect, test } from "vitest";

describe(rollKitAttackEnergy, () => {
  test("raises a sword's chance from 10% by 5% a miss, back to 10% once a hit gives energy", () => {
    expect.hasAssertions();

    const kitState = createKitState();
    const rolls = Array.from({ length: 4 }, () => rollKitAttackEnergy(kitState, WeaponType.Sword, () => 0.12));

    expect(rolls).toStrictEqual([false, true, false, true]);
    expect(kitState.attackEnergyMissCount).toBe(0);
  });
});
