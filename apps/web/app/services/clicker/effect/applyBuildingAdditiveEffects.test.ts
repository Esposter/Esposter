import type { Effect } from "#shared/models/clicker/data/effect/Effect";

import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { createBuildingWithStatistics } from "@/services/clicker/createBuildingWithStatistics.test";
import { applyBuildingAdditiveEffects } from "@/services/clicker/effect/applyBuildingAdditiveEffects";
import { describe, expect, test } from "vitest";

describe(applyBuildingAdditiveEffects, () => {
  const basePower = 0;
  const value = 1;
  const amount = 2;
  const createEffect = (targets: BuildingId[]): Effect => ({
    configuration: { targets, type: EffectType.BuildingAdditive },
    targets: [],
    value,
  });

  test("adds the effect once per owned unit of each target", () => {
    expect.hasAssertions();

    const effect = createEffect([BuildingId.Cursor, BuildingId.Grandma]);
    const boughtBuildings = [
      createBuildingWithStatistics(BuildingId.Cursor, amount),
      createBuildingWithStatistics(BuildingId.Grandma, amount),
    ];

    expect(applyBuildingAdditiveEffects(basePower, [effect], boughtBuildings)).toBe(value * amount * 2);
  });

  // An unowned target is one target contributing nothing, never a reason to stop reading the rest of the list
  test("counts the targets behind an unowned one", () => {
    expect.hasAssertions();

    const effect = createEffect([BuildingId.Farm, BuildingId.Grandma]);
    const boughtBuildings = [createBuildingWithStatistics(BuildingId.Grandma, amount)];

    expect(applyBuildingAdditiveEffects(basePower, [effect], boughtBuildings)).toBe(value * amount);
  });
});
