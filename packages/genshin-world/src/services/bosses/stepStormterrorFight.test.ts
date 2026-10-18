import { STORMTERROR_PHASES } from "#src/services/bosses/stormterror";
import { STORMTERROR_FIGHT_START, stepStormterrorFight } from "#src/services/bosses/stepStormterrorFight";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(stepStormterrorFight, () => {
  test("a phase holds until its time limit or its shield limit is reached", () => {
    expect.hasAssertions();

    const { fight, transitionAttacks } = stepStormterrorFight(
      STORMTERROR_FIGHT_START,
      takeOne(STORMTERROR_PHASES, 0).timeLimitSeconds - 1,
      0,
    );

    expect(fight).toStrictEqual({
      phase: 1,
      phaseElapsedSeconds: takeOne(STORMTERROR_PHASES, 0).timeLimitSeconds - 1,
      totalShieldBreaks: 0,
    });
    expect(transitionAttacks).toStrictEqual([]);
  });

  test("a phase ends when its time limit runs out, with its transition attack", () => {
    expect.hasAssertions();

    const { fight, transitionAttacks } = stepStormterrorFight(
      STORMTERROR_FIGHT_START,
      takeOne(STORMTERROR_PHASES, 0).timeLimitSeconds,
      0,
    );

    expect(fight).toStrictEqual({ phase: 2, phaseElapsedSeconds: 0, totalShieldBreaks: 0 });
    expect(transitionAttacks).toStrictEqual([takeOne(STORMTERROR_PHASES, 0).transitionAttack]);
  });

  test("a phase ends when the fight's shield breaks reach its limit", () => {
    expect.hasAssertions();

    const { fight, transitionAttacks } = stepStormterrorFight(
      STORMTERROR_FIGHT_START,
      0,
      takeOne(STORMTERROR_PHASES, 0).shieldLimit,
    );

    expect(fight).toStrictEqual({
      phase: 2,
      phaseElapsedSeconds: 0,
      totalShieldBreaks: takeOne(STORMTERROR_PHASES, 0).shieldLimit,
    });
    expect(transitionAttacks).toStrictEqual([takeOne(STORMTERROR_PHASES, 0).transitionAttack]);
  });

  test("phase three ends with Energy Lightning", () => {
    expect.hasAssertions();

    const phaseThree = {
      phase: 3,
      phaseElapsedSeconds: 0,
      totalShieldBreaks: takeOne(STORMTERROR_PHASES, 1).shieldLimit,
    };
    const { fight, transitionAttacks } = stepStormterrorFight(
      phaseThree,
      takeOne(STORMTERROR_PHASES, 2).timeLimitSeconds,
      0,
    );

    expect(fight.phase).toBe(4);
    expect(transitionAttacks).toStrictEqual(["Energy Lightning"]);
  });

  test("the fifth phase lasts to the fight's end", () => {
    expect.hasAssertions();

    const phaseFive = {
      phase: 5,
      phaseElapsedSeconds: 0,
      totalShieldBreaks: takeOne(STORMTERROR_PHASES, 3).shieldLimit,
    };
    const { fight, transitionAttacks } = stepStormterrorFight(phaseFive, Number.MAX_SAFE_INTEGER, 100);

    expect(fight.phase).toBe(5);
    expect(transitionAttacks).toStrictEqual([]);
  });
});
