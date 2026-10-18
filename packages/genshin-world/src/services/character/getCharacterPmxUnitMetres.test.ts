import { CHARACTER_PMX_RECKONED_UNIT_METRES, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getCharacterPmxUnitMetres } from "#src/services/character/getCharacterPmxUnitMetres";
import { describe, expect, test } from "vitest";

// The Traveler's PMX stands 17.2332 units tall, and the game's own model of the Traveler 1.5667 metres, as the measure reads them
const TRAVELER_PMX_HEIGHT_UNITS = 17.2332;
const TRAVELER_GAME_MODEL_HEIGHT_METRES = 1.5667;

describe(getCharacterPmxUnitMetres, () => {
  test("the Traveler's height matches the game's model", () => {
    expect.hasAssertions();

    expect(TRAVELER_PMX_HEIGHT_UNITS * getCharacterPmxUnitMetres(TRAVELER_CHARACTER_ID)).toBeCloseTo(
      TRAVELER_GAME_MODEL_HEIGHT_METRES,
      3,
    );
  });

  test("a character no measure holds keeps the reckoned unit", () => {
    expect.hasAssertions();

    expect(getCharacterPmxUnitMetres(0)).toBe(CHARACTER_PMX_RECKONED_UNIT_METRES);
  });
});
