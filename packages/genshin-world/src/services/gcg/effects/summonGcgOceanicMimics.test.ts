import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { summonGcgOceanicMimics } from "#src/services/gcg/effects/summonGcgOceanicMimics";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const OCEANIC_MIMIC_SQUIRREL_ID = 122_011;
const OCEANIC_MIMIC_RAPTOR_ID = 122_012;
const OCEANIC_MIMIC_FROG_ID = 122_013;

const createSide = (): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters: [],
  dice: [],
  deckCardIds: [],
  drawPile: [],
  hand: [],
  hasDeclaredEnd: false,
  hasPrepared: true,
  hasRolled: true,
  isReplacementPending: false,
  onstages: [],
  summons: [],
  supports: [],
  usedCardIds: [],
  usedSkillIds: [],
});

describe(summonGcgOceanicMimics, () => {
  test("it summons the kinds fewest on the field first, one of each before a kind repeats", () => {
    expect.hasAssertions();

    const side = createSide();

    summonGcgOceanicMimics(side, 2);

    expect(side.summons.map(({ cardId }) => cardId)).toStrictEqual([
      OCEANIC_MIMIC_SQUIRREL_ID,
      OCEANIC_MIMIC_RAPTOR_ID,
    ]);
  });

  test("a Mimic already on the field is refreshed to its usages rather than doubled", () => {
    expect.hasAssertions();

    const side = createSide();
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
