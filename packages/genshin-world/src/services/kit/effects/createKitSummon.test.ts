import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { createKitBody } from "#src/services/kit/createKitBody";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createKitSummon, () => {
  test("lingers from its cast when it has no hit", () => {
    expect.hasAssertions();

    const summon = createKitSummon(
      createKitBody({ x: 0, z: 0 }),
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
