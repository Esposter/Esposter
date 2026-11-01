import {
  OCEANIC_MIMIC_FROG_ID,
  OCEANIC_MIMIC_RAPTOR_ID,
  OCEANIC_MIMIC_SQUIRREL_ID,
} from "#src/services/gcg/cards/constants";
import { createSideState } from "#src/services/gcg/cards/createSideState.test";
import { summonGcgOceanicMimics } from "#src/services/gcg/effects/summonGcgOceanicMimics";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(summonGcgOceanicMimics, () => {
  test("it summons the kinds fewest on the field first, one of each before a kind repeats", () => {
    expect.hasAssertions();

    const side = createSideState([]);

    summonGcgOceanicMimics(side, 2);

    expect(side.summons.map(({ cardId }) => cardId)).toStrictEqual([
      OCEANIC_MIMIC_SQUIRREL_ID,
      OCEANIC_MIMIC_RAPTOR_ID,
    ]);
  });

  test("a Mimic already on the field is refreshed to its usages rather than doubled", () => {
    expect.hasAssertions();

    const side = createSideState([]);
    summonGcgOceanicMimics(side, 3);
    takeOne(side.summons, 0).usages = 1;

    summonGcgOceanicMimics(side, 1);

    expect(side.summons.map(({ cardId }) => cardId)).toStrictEqual([
      OCEANIC_MIMIC_SQUIRREL_ID,
      OCEANIC_MIMIC_RAPTOR_ID,
      OCEANIC_MIMIC_FROG_ID,
    ]);
    expect(side.summons.map(({ usages }) => usages)).toStrictEqual([2, 3, 1]);
  });
});
