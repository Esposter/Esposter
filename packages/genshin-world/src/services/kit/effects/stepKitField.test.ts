import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import type { KitField } from "#src/models/kit/KitField";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitField } from "#src/services/kit/effects/stepKitField";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(stepKitField, () => {
  test("ticks on the frame its interval falls due, two seconds in, not a frame later", () => {
    expect.hasAssertions();

    const ticks: number[] = [];
    const field: KitField = {
      centre: { x: 0, z: 0 },
      characterId: TRAVELER_CHARACTER_ID,
      kind: "field",
      nextTickSeconds: 2,
      onTick: (_context, tickIndex) => {
        ticks.push(tickIndex);
      },
      radius: 10,
      secondsRemaining: 10,
      tickIndex: 0,
      tickIntervalSeconds: 2,
    };
    const context = createKitTestContext({
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: TRAVELER_KIT,
      level: 90,
    });
    for (let frame = 0; frame < 119; frame++) stepKitField(field, FIXED_STEP_SECONDS, context);
    expect(ticks).toStrictEqual([]);

    stepKitField(field, FIXED_STEP_SECONDS, context);
    expect(ticks).toStrictEqual([0]);
  });
});
