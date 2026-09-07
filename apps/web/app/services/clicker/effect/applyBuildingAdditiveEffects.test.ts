import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { Effect } from "#shared/models/clicker/data/effect/Effect";

import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { applyBuildingAdditiveEffects } from "@/services/clicker/effect/applyBuildingAdditiveEffects";
import { describe, expect, test } from "vitest";

describe(applyBuildingAdditiveEffects, () => {
  const basePower = 0;
  const value = 1;
  const amount = 2;
  const createBuilding = (id: BuildingId): BuildingWithStatistics => ({
    amount,
    basePrice: 1,
    baseValue: 1,
    flavorDescription: "",
    id,
    producedValue: 0,
  });
  const createEffect = (targets: BuildingId[]): Effect => ({
    configuration: { targets, type: EffectType.BuildingAdditive },
    targets: [],
    value,
  });

  test("adds the effect once per owned unit of each target", () => {
    expect.hasAssertions();

    const effect = createEffect([BuildingId.Cursor, BuildingId.Grandma]);
    const boughtBuildings = [createBuilding(BuildingId.Cursor), createBuilding(BuildingId.Grandma)];

    expect(applyBuildingAdditiveEffects(basePower, [effect], boughtBuildings)).toBe(value * amount * 2);
  });

  // An unowned target is one target contributing nothing, never a reason to stop reading the rest of the list
  test("counts the targets behind an unowned one", () => {
    expect.hasAssertions();

    const effect = createEffect([BuildingId.Farm, BuildingId.Grandma]);
    const boughtBuildings = [createBuilding(BuildingId.Grandma)];

    expect(applyBuildingAdditiveEffects(basePower, [effect], boughtBuildings)).toBe(value * amount);
  });
});
