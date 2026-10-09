import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers([TRAVELER_CHARACTER_ID]));

describe(createKitSummon, () => {
  test("lingers from its cast when it has no hit", () => {
    expect.hasAssertions();

    const summon = createKitSummon(
      { facing: 0, height: 0, position: { x: 0, z: 0 } },
      {
        ascension: 0,
        attributes: computeCharacterAttributes([]),
        characterId: TRAVELER_CHARACTER_ID,
        constellationCount: 0,
        elementalResonances: [],
        kit: TRAVELER_KIT,
        level: 90,
      },
      [],
    );

    expect(summon.secondsRemaining).toBe(SUMMON_LINGER_SECONDS);
  });
});
