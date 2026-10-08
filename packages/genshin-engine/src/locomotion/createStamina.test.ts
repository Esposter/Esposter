import {
  DASH_STAMINA_COST,
  STAMINA_MAX,
  STAMINA_REFILL_DELAY_SECONDS,
  STAMINA_REFILL_PER_SECOND,
  SWIM_STROKE_SECONDS,
  SWIM_STROKE_STAMINA_COST,
} from "#src/locomotion/constants";
import { createStamina } from "#src/locomotion/createStamina";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";
import { describe, expect, test } from "vitest";

describe(createStamina, () => {
  const STEP_SECONDS = 0.5;

  test("spends a dash once, as it starts", () => {
    expect.hasAssertions();

    const stamina = createStamina();
    stamina.step({ state: LocomotionState.Dash, stateSeconds: 0 }, true, true, STEP_SECONDS);
    stamina.step({ state: LocomotionState.Dash, stateSeconds: STEP_SECONDS }, false, true, STEP_SECONDS);

    expect(stamina.value).toBe(STAMINA_MAX - DASH_STAMINA_COST);
  });

  test("refills only once the body has rested the delay", () => {
    expect.hasAssertions();

    const stamina = createStamina();
    stamina.step({ state: LocomotionState.Dash, stateSeconds: 0 }, true, true, STEP_SECONDS);
    for (let restSeconds = STEP_SECONDS; restSeconds < STAMINA_REFILL_DELAY_SECONDS; restSeconds += STEP_SECONDS)
      stamina.step({ state: LocomotionState.Idle, stateSeconds: restSeconds }, false, false, STEP_SECONDS);
    const restedValue = stamina.value;
    stamina.step(
      { state: LocomotionState.Idle, stateSeconds: STAMINA_REFILL_DELAY_SECONDS },
      false,
      false,
      STEP_SECONDS,
    );

    expect({ refilledValue: stamina.value, restedValue }).toStrictEqual({
      refilledValue: STAMINA_MAX - DASH_STAMINA_COST + STAMINA_REFILL_PER_SECOND * STEP_SECONDS,
      restedValue: STAMINA_MAX - DASH_STAMINA_COST,
    });
  });

  test("spends a stroke as a swim starts and at each stroke after, and never refills in water", () => {
    expect.hasAssertions();

    const stamina = createStamina();
    stamina.step({ state: LocomotionState.Swim, stateSeconds: 0 }, true, true, STEP_SECONDS);
    for (let stepIndex = 1; stepIndex <= Math.ceil(SWIM_STROKE_SECONDS / STEP_SECONDS); stepIndex++)
      stamina.step({ state: LocomotionState.Swim, stateSeconds: stepIndex * STEP_SECONDS }, false, true, STEP_SECONDS);

    expect(stamina.value).toBe(STAMINA_MAX - SWIM_STROKE_STAMINA_COST * 2);
  });

  test("never spends below none", () => {
    expect.hasAssertions();

    const stamina = createStamina();
    stamina.value = 1;
    stamina.step({ state: LocomotionState.Dash, stateSeconds: 0 }, true, true, STEP_SECONDS);

    expect(stamina.value).toBe(0);
  });

  test("a spend restarts the rest, so the pool refills only once the delay has passed since it", () => {
    expect.hasAssertions();

    const stamina = createStamina();
    for (let restSeconds = STEP_SECONDS; restSeconds < STAMINA_REFILL_DELAY_SECONDS; restSeconds += STEP_SECONDS)
      stamina.step({ state: LocomotionState.Idle, stateSeconds: restSeconds }, false, false, STEP_SECONDS);
    stamina.spend(DASH_STAMINA_COST);
    const spentValue = stamina.value;
    for (let restSeconds = STEP_SECONDS; restSeconds < STAMINA_REFILL_DELAY_SECONDS; restSeconds += STEP_SECONDS)
      stamina.step({ state: LocomotionState.Idle, stateSeconds: restSeconds }, false, false, STEP_SECONDS);
    const restedValue = stamina.value;
    stamina.step(
      { state: LocomotionState.Idle, stateSeconds: STAMINA_REFILL_DELAY_SECONDS },
      false,
      false,
      STEP_SECONDS,
    );

    expect({ refilledValue: stamina.value, restedValue, spentValue }).toStrictEqual({
      refilledValue: spentValue + STAMINA_REFILL_PER_SECOND * STEP_SECONDS,
      restedValue: spentValue,
      spentValue: STAMINA_MAX - DASH_STAMINA_COST,
    });
  });
});
