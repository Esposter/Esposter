import { PerpetualMechanicalArrayMode } from "#src/models/bosses/PerpetualMechanicalArrayMode";
import {
  PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_EXIT_SECONDS,
  PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
  PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS,
  PERPETUAL_MECHANICAL_ARRAY_INVULNERABLE_SECONDS,
  PERPETUAL_MECHANICAL_ARRAY_PARALYSIS_SECONDS,
} from "#src/services/bosses/constants";
import {
  PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
  stepPerpetualMechanicalArrayFight,
} from "#src/services/bosses/stepPerpetualMechanicalArrayFight";
import { describe, expect, test } from "vitest";

describe(stepPerpetualMechanicalArrayFight, () => {
  test("the boss enters Defensive Mode once its health reaches 35% before its first timed activation", () => {
    expect.hasAssertions();

    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(
      PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
      0,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
      false,
    );

    expect(fight).toStrictEqual({
      fightSeconds: 0,
      isDefensiveModeTriggered: true,
      mode: PerpetualMechanicalArrayMode.DefensiveMode,
      modeSeconds: 0,
    });
    expect(modesEntered).toStrictEqual([PerpetualMechanicalArrayMode.DefensiveMode]);
  });

  test("the boss enters Defensive Mode at its first timed activation when its health has not reached 35%", () => {
    expect.hasAssertions();

    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(
      PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS,
      1,
      false,
    );

    expect(fight.mode).toBe(PerpetualMechanicalArrayMode.DefensiveMode);
    expect(modesEntered).toStrictEqual([PerpetualMechanicalArrayMode.DefensiveMode]);
  });

  test("the boss keeps attacking above 35% health before its first timed activation", () => {
    expect.hasAssertions();

    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(
      PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS - 1,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH + 0.01,
      false,
    );

    expect(fight).toStrictEqual({
      fightSeconds: PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS - 1,
      isDefensiveModeTriggered: false,
      mode: PerpetualMechanicalArrayMode.Attacking,
      modeSeconds: PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS - 1,
    });
    expect(modesEntered).toStrictEqual([]);
  });

  test("a Defensive Mode that has ended is not entered again", () => {
    expect.hasAssertions();

    const { fight: entered } = stepPerpetualMechanicalArrayFight(
      PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS,
      1,
      false,
    );
    const { fight: exited } = stepPerpetualMechanicalArrayFight(
      entered,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_EXIT_SECONDS,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
      false,
    );
    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(
      exited,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
      false,
    );

    expect(fight.mode).toBe(PerpetualMechanicalArrayMode.Attacking);
    expect(modesEntered).toStrictEqual([]);
  });

  test("defeating the highlighted Ruin Sentinel paralyses the boss", () => {
    expect.hasAssertions();

    const { fight: inDefensiveMode } = stepPerpetualMechanicalArrayFight(
      PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
      0,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
      false,
    );
    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(inDefensiveMode, 0, 0, true);

    expect(fight).toStrictEqual({
      fightSeconds: 0,
      isDefensiveModeTriggered: true,
      mode: PerpetualMechanicalArrayMode.Paralysed,
      modeSeconds: 0,
    });
    expect(modesEntered).toStrictEqual([PerpetualMechanicalArrayMode.Paralysed]);
  });

  test("a paralysis lasts 20 seconds, then the boss is invulnerable for a second", () => {
    expect.hasAssertions();

    const { fight: paralysed } = stepPerpetualMechanicalArrayFight(
      { ...PERPETUAL_MECHANICAL_ARRAY_FIGHT_START, mode: PerpetualMechanicalArrayMode.Paralysed },
      0,
      0,
      false,
    );
    const { fight: short, modesEntered: shortModesEntered } = stepPerpetualMechanicalArrayFight(
      paralysed,
      PERPETUAL_MECHANICAL_ARRAY_PARALYSIS_SECONDS - 1,
      0,
      false,
    );
    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(short, 1, 0, false);

    expect(short.mode).toBe(PerpetualMechanicalArrayMode.Paralysed);
    expect(shortModesEntered).toStrictEqual([]);
    expect(fight.mode).toBe(PerpetualMechanicalArrayMode.Invulnerable);
    expect(modesEntered).toStrictEqual([PerpetualMechanicalArrayMode.Invulnerable]);
  });

  test("the boss resumes its attacks once its invulnerable second is over", () => {
    expect.hasAssertions();

    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(
      {
        ...PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
        isDefensiveModeTriggered: true,
        mode: PerpetualMechanicalArrayMode.Invulnerable,
      },
      PERPETUAL_MECHANICAL_ARRAY_INVULNERABLE_SECONDS,
      0,
      false,
    );

    expect(fight.mode).toBe(PerpetualMechanicalArrayMode.Attacking);
    expect(modesEntered).toStrictEqual([PerpetualMechanicalArrayMode.Attacking]);
  });

  test("one step across a paralysis and its invulnerable second resumes the attacks", () => {
    expect.hasAssertions();

    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(
      {
        ...PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
        isDefensiveModeTriggered: true,
        mode: PerpetualMechanicalArrayMode.Paralysed,
      },
      PERPETUAL_MECHANICAL_ARRAY_PARALYSIS_SECONDS + PERPETUAL_MECHANICAL_ARRAY_INVULNERABLE_SECONDS,
      0,
      false,
    );

    expect(fight.mode).toBe(PerpetualMechanicalArrayMode.Attacking);
    expect(modesEntered).toStrictEqual([
      PerpetualMechanicalArrayMode.Invulnerable,
      PerpetualMechanicalArrayMode.Attacking,
    ]);
  });

  test("a defensive mode holds while its highlighted sentinel stands, short of its exit time", () => {
    expect.hasAssertions();

    const { fight: inDefensiveMode } = stepPerpetualMechanicalArrayFight(
      PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
      0,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
      false,
    );
    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(
      inDefensiveMode,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_EXIT_SECONDS - 1,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
      false,
    );

    expect(fight.mode).toBe(PerpetualMechanicalArrayMode.DefensiveMode);
    expect(modesEntered).toStrictEqual([]);
  });

  test("a defensive mode exits without paralysis once its exit time passes with the sentinel standing", () => {
    expect.hasAssertions();

    const { fight: inDefensiveMode } = stepPerpetualMechanicalArrayFight(
      PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
      0,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
      false,
    );
    const { fight, modesEntered } = stepPerpetualMechanicalArrayFight(
      inDefensiveMode,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_EXIT_SECONDS,
      PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
      false,
    );

    expect(fight).toStrictEqual({
      fightSeconds: PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_EXIT_SECONDS,
      isDefensiveModeTriggered: true,
      mode: PerpetualMechanicalArrayMode.Attacking,
      modeSeconds: 0,
    });
    expect(modesEntered).toStrictEqual([PerpetualMechanicalArrayMode.Attacking]);
  });
});
