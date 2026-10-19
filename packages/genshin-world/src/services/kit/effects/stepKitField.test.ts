import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitField } from "#src/models/kit/KitField";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitField } from "#src/services/kit/effects/stepKitField";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// A field at the body's origin, so every tick falls inside it, due at the given frame and repeating at the interval
const createField = (nextTickSeconds: number, tickIntervalSeconds: number, onTick: KitField["onTick"]): KitField => ({
  centre: { x: 0, z: 0 },
  characterId: TRAVELER_CHARACTER_ID,
  kind: "field",
  nextTickSeconds,
  onTick,
  radius: Number.POSITIVE_INFINITY,
  secondsRemaining: Number.POSITIVE_INFINITY,
  tickIndex: 0,
  tickIntervalSeconds,
});
// The given frames stepped on the field at the world's fixed step, so a test reads its ticks after each one
const stepFieldFrames = (field: KitField, context: KitContext, frames: number): void => {
  for (let frame = 0; frame < frames; frame++) stepKitField(field, FIXED_STEP_SECONDS, context);
};

describe(stepKitField, () => {
  const COMBATANT: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };

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
    const context = createKitTestContext(COMBATANT);
    for (let frame = 0; frame < 119; frame++) stepKitField(field, FIXED_STEP_SECONDS, context);
    expect(ticks).toStrictEqual([]);

    stepKitField(field, FIXED_STEP_SECONDS, context);
    expect(ticks).toStrictEqual([0]);
  });

  test.each([13, 29, 48, 63, 104, 162, 221])(
    "a tick due at %i frames falls on that frame's step, not the one after",
    (dueFrames) => {
      expect.hasAssertions();
      const onTick = vi.fn<KitField["onTick"]>();
      const field = createField(dueFrames / 60, Number.POSITIVE_INFINITY, onTick);
      const context = createKitTestContext(COMBATANT);

      stepFieldFrames(field, context, dueFrames - 1);
      expect(onTick).not.toHaveBeenCalled();
      stepFieldFrames(field, context, 1);
      expect(onTick).toHaveBeenCalledExactlyOnceWith(context, 0);
    },
  );

  test("a repeating tick falls on each interval's frame, 29 frames then every 60", () => {
    expect.hasAssertions();
    const onTick = vi.fn<KitField["onTick"]>();
    const field = createField(29 / 60, 1, onTick);
    const context = createKitTestContext(COMBATANT);

    stepFieldFrames(field, context, 28);
    expect(onTick).not.toHaveBeenCalled();
    stepFieldFrames(field, context, 1);
    expect(onTick).toHaveBeenCalledTimes(1);
    stepFieldFrames(field, context, 59);
    expect(onTick).toHaveBeenCalledTimes(1);
    stepFieldFrames(field, context, 1);
    expect(onTick).toHaveBeenCalledTimes(2);
    expect(onTick).toHaveBeenLastCalledWith(context, 1);
  });

  test("a field's step hook is given the seconds the step covers, so a rate on the field counts them", () => {
    expect.hasAssertions();

    const onStep = vi.fn<NonNullable<KitField["onStep"]>>();
    const field: KitField = { ...createField(60, 60, vi.fn<KitField["onTick"]>()), onStep };
    const context = createKitTestContext(COMBATANT);
    stepKitField(field, 0.5, context);

    expect(onStep).toHaveBeenCalledWith(context, field, 0.5);
  });
});
