import type { Effect } from "#shared/models/clicker/data/effect/Effect";

import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { createBuildingWithStatistics } from "@/services/clicker/createBuildingWithStatistics.test";
import { applyBuildingAdditiveNorEffects } from "@/services/clicker/effect/applyBuildingAdditiveNorEffects";
import { describe, expect, test } from "vitest";

describe(applyBuildingAdditiveNorEffects, () => {
  const basePower = 0;
  const value = 1;
  const amount = 2;

  // The effect names the buildings it leaves out, so only the rest of the owned buildings add to the power
  test("adds the effect once per owned unit of every building it does not name", () => {
    expect.hasAssertions();

    const effect: Effect = {
      configuration: { targets: [BuildingId.Cursor], type: EffectType.BuildingAdditiveNor },
      targets: [],
      value,
    };
    const boughtBuildings = [
      createBuildingWithStatistics(BuildingId.Cursor, amount),
      createBuildingWithStatistics(BuildingId.Grandma, amount),
    ];

    expect(applyBuildingAdditiveNorEffects(basePower, [effect], boughtBuildings)).toBe(value * amount);
  });

  // An effect that names no building leaves every owned building to it
  test("adds the effect for every owned building when it names none", () => {
    expect.hasAssertions();

    const effect: Effect = { configuration: { type: EffectType.BuildingAdditiveNor }, targets: [], value };
    const boughtBuildings = [
      createBuildingWithStatistics(BuildingId.Cursor, amount),
      createBuildingWithStatistics(BuildingId.Grandma, amount),
    ];

    expect(applyBuildingAdditiveNorEffects(basePower, [effect], boughtBuildings)).toBe(value * amount * 2);
  });
});
