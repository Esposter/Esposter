import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe("stepKitEffects", () => {
  const COMBATANT: KitSummon["combatant"] = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };

  test.each([
    [0.25, 1],
    [0, 0],
  ])(
    "a summon with %d seconds left as the step begins lands %i of the hits due in it",
    (secondsRemaining, strikeCount) => {
      expect.hasAssertions();
      const summon: KitSummon = {
        body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
        combatant: COMBATANT,
        elapsedSeconds: 0,
        hits: [
          {
            hitArea: { angle: 2 * Math.PI, height: 2, radius: 1 },
            hitmarkSeconds: 0.25,
            poiseDamage: 0,
            talentMultiplier: 1,
          },
        ],
        kind: "summon",
        nextHitIndex: 0,
        secondsRemaining,
      };
      const context = createKitTestContext(COMBATANT, { kitEffectState: { effects: [summon] } });

      expect(stepKitTestEffects(0.5, context)).toHaveLength(strikeCount);
      expect(context.kitEffectState.effects).toStrictEqual([]);
    },
  );

  describe("a status's five seconds", () => {
    const STATUS_ID = "five-second-status";
    // The status a combatant carries for five seconds, stepped the way the world steps it, at the fixed step
    const createStatusContext = () => {
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(COMBATANT, { kitEffectState });
      addKitStatus(kitEffectState, TRAVELER_CHARACTER_ID, { id: STATUS_ID, secondsRemaining: 5 });
      return { context, kitEffectState };
    };

    test("reads active at four seconds of steps", () => {
      expect.hasAssertions();
      const { context, kitEffectState } = createStatusContext();
      stepKitSeconds(context, 4);

      expect(checkIsKitStatusActive(kitEffectState.effects, TRAVELER_CHARACTER_ID, STATUS_ID)).toBe(true);
    });

    test("reads inactive and is dropped at exactly five seconds of steps", () => {
      expect.hasAssertions();
      const { context, kitEffectState } = createStatusContext();
      stepKitSeconds(context, 5);

      expect([
        checkIsKitStatusActive(kitEffectState.effects, TRAVELER_CHARACTER_ID, STATUS_ID),
        kitEffectState.effects,
      ]).toStrictEqual([false, []]);
    });

    test("reads a field a tick adds with the status's seconds gone with it at 360 frames", () => {
      expect.hasAssertions();
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(COMBATANT, { kitEffectState });
      addKitStatus(kitEffectState, TRAVELER_CHARACTER_ID, { id: STATUS_ID, secondsRemaining: 6 });
      scheduleKitTask(kitEffectState, TRAVELER_CHARACTER_ID, 221 / 60, (tick) => {
        const status = findKitStatus(tick.kitEffectState.effects, TRAVELER_CHARACTER_ID, STATUS_ID);
        castKitField(
          tick.kitEffectState,
          TRAVELER_CHARACTER_ID,
          { x: 0, z: 0 },
          {
            id: "copy",
            nextTickSeconds: Number.POSITIVE_INFINITY,
            onTick: () => {},
            secondsRemaining: status?.secondsRemaining ?? 0,
            tickIntervalSeconds: Number.POSITIVE_INFINITY,
          },
        );
      });
      const checkIsCopyPresent = () =>
        kitEffectState.effects.some((effect) => effect.kind === "field" && effect.id === "copy");

      stepKitSeconds(context, 359 / 60);
      const presentAt359 = [
        checkIsKitStatusActive(kitEffectState.effects, TRAVELER_CHARACTER_ID, STATUS_ID),
        checkIsCopyPresent(),
      ];
      stepKitSeconds(context, 1 / 60);

      expect([
        presentAt359,
        [checkIsKitStatusActive(kitEffectState.effects, TRAVELER_CHARACTER_ID, STATUS_ID), checkIsCopyPresent()],
      ]).toStrictEqual([
        [true, true],
        [false, false],
      ]);
    });
  });
});
