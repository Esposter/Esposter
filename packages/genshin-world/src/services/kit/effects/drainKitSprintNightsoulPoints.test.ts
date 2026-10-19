import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { drainKitSprintNightsoulPoints } from "#src/services/kit/effects/drainKitSprintNightsoulPoints";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const createTravelerCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
});

describe(drainKitSprintNightsoulPoints, () => {
  const POINTS = 10;
  const SPRINT_DRAIN = 3;

  test("drains its amount on the step a sprint starts, and nothing on the steps after it", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createTravelerCombatant());
    enterKitNightsoulBlessing(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      points: POINTS,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    const kitState = createKitState();
    for (let step = 0; step < 3; step++) {
      kitState.sprintSeconds += FIXED_STEP_SECONDS;
      drainKitSprintNightsoulPoints(context, kitState, FIXED_STEP_SECONDS, SPRINT_DRAIN);
    }

    expect(countKitResource(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(
      POINTS - SPRINT_DRAIN,
    );
  });

  test("drains nothing on a sprint that starts outside a Nightsoul Blessing", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createTravelerCombatant());
    const kitState = { ...createKitState(), sprintSeconds: FIXED_STEP_SECONDS };
    drainKitSprintNightsoulPoints(context, kitState, FIXED_STEP_SECONDS, SPRINT_DRAIN);

    expect(countKitResource(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });
});
