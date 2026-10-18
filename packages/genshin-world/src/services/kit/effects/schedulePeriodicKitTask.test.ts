import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { schedulePeriodicKitTask } from "#src/services/kit/effects/schedulePeriodicKitTask";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const FRAME_SECONDS = 1 / 60;

const COMBATANT: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
};

// The frames, counted from the cast, on which the task ticks, with the body set where a test puts it
const runTickFrames = (
  {
    firstSeconds,
    intervalSeconds,
    untilSeconds,
  }: { firstSeconds: number; intervalSeconds: number; untilSeconds: number },
  framesToRun: number,
  bodyX = 0,
): number[] => {
  const context = createKitTestContext(COMBATANT, { body: { facing: 0, height: 0, position: { x: bodyX, z: 0 } } });
  const tickFrames: number[] = [];
  let frame = 0;
  schedulePeriodicKitTask(
    context.kitEffectState,
    COMBATANT.characterId,
    { firstSeconds, intervalSeconds, untilSeconds },
    () => {
      tickFrames.push(frame);
    },
  );
  for (let stepIndex = 0; stepIndex < framesToRun; stepIndex++) {
    frame++;
    stepKitEffects(FRAME_SECONDS, context);
  }
  return tickFrames;
};

describe(schedulePeriodicKitTask, () => {
  test("ticks on its first frame and every interval after, the last before its end, as Jahoda's heals fall", () => {
    // Jahoda's heals: the first 12 frames in, then every 87, through her burst's 790
    expect(runTickFrames({ firstSeconds: 12 / 60, intervalSeconds: 87 / 60, untilSeconds: 790 / 60 }, 800)).toEqual([
      12, 99, 186, 273, 360, 447, 534, 621, 708,
    ]);
  });

  test("passes over a tick that falls at its end exactly", () => {
    // Ticks at frames 12 and 99 only: the one at 186 is the end, so it is not run
    expect(runTickFrames({ firstSeconds: 12 / 60, intervalSeconds: 87 / 60, untilSeconds: 186 / 60 }, 220)).toEqual([
      12, 99,
    ]);
  });

  test("runs wherever the body stands, as it is not a field the body must stand in", () => {
    expect(
      runTickFrames({ firstSeconds: 12 / 60, intervalSeconds: 87 / 60, untilSeconds: 300 / 60 }, 320, 500),
    ).toEqual(runTickFrames({ firstSeconds: 12 / 60, intervalSeconds: 87 / 60, untilSeconds: 300 / 60 }, 320));
  });
});
