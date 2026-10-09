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
  const CONSUMPTION_MULTIPLIER = 0.85;
  const POOL_VALUE = 18;
  const SECOND_CONSUMPTION_MULTIPLIER = 0.9;
  const SPEND_AMOUNT = 20;
  const STEP_SECONDS = 0.5;

  test("spends a dash at the consumption multiplier's share of its cost", () => {
    expect.hasAssertions();

    const stamina = createStamina(STAMINA_MAX, () => CONSUMPTION_MULTIPLIER);
    stamina.step({ state: LocomotionState.Dash, stateSeconds: 0 }, true, true, STEP_SECONDS);

    expect(stamina.value).toBe(STAMINA_MAX - DASH_STAMINA_COST * CONSUMPTION_MULTIPLIER);
  });

  test("reads the multiplier at each spend, so a change takes effect at the next one", () => {
    expect.hasAssertions();

    let multiplier = 1;
    const stamina = createStamina(STAMINA_MAX, () => multiplier);
    stamina.spend(SPEND_AMOUNT);
    multiplier = CONSUMPTION_MULTIPLIER;
    stamina.spend(SPEND_AMOUNT);

    expect(stamina.value).toBe(STAMINA_MAX - SPEND_AMOUNT - SPEND_AMOUNT * CONSUMPTION_MULTIPLIER);
  });

  test("composes two multipliers by their product, not their sum", () => {
    expect.hasAssertions();

    const stamina = createStamina(STAMINA_MAX, () => CONSUMPTION_MULTIPLIER * SECOND_CONSUMPTION_MULTIPLIER);
    stamina.spend(SPEND_AMOUNT);

    expect(stamina.value).toBe(STAMINA_MAX - SPEND_AMOUNT * (CONSUMPTION_MULTIPLIER * SECOND_CONSUMPTION_MULTIPLIER));
  });

  test("checks a spend at its multiplied cost, so a pool short of the full amount still pays the reduced one", () => {
    expect.hasAssertions();

    const discountedStamina = createStamina(STAMINA_MAX, () => CONSUMPTION_MULTIPLIER);
    const fullStamina = createStamina(STAMINA_MAX);
    discountedStamina.value = POOL_VALUE;
    fullStamina.value = POOL_VALUE;

    expect({
      discounted: discountedStamina.checkCanSpend(SPEND_AMOUNT),
      full: fullStamina.checkCanSpend(SPEND_AMOUNT),
    }).toStrictEqual({ discounted: true, full: false });
  });

  test("spends a dash once, as it starts", () => {
    expect.hasAssertions();

    const stamina = createStamina(STAMINA_MAX);
    stamina.step({ state: LocomotionState.Dash, stateSeconds: 0 }, true, true, STEP_SECONDS);
    stamina.step({ state: LocomotionState.Dash, stateSeconds: STEP_SECONDS }, false, true, STEP_SECONDS);

    expect(stamina.value).toBe(STAMINA_MAX - DASH_STAMINA_COST);
  });

  test("refills only once the body has rested the delay", () => {
    expect.hasAssertions();

    const stamina = createStamina(STAMINA_MAX);
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

    const stamina = createStamina(STAMINA_MAX);
    stamina.step({ state: LocomotionState.Swim, stateSeconds: 0 }, true, true, STEP_SECONDS);
    for (let stepIndex = 1; stepIndex <= Math.ceil(SWIM_STROKE_SECONDS / STEP_SECONDS); stepIndex++)
      stamina.step({ state: LocomotionState.Swim, stateSeconds: stepIndex * STEP_SECONDS }, false, true, STEP_SECONDS);

    expect(stamina.value).toBe(STAMINA_MAX - SWIM_STROKE_STAMINA_COST * 2);
  });

  test("never spends below none", () => {
    expect.hasAssertions();

    const stamina = createStamina(STAMINA_MAX);
    stamina.value = 1;
    stamina.step({ state: LocomotionState.Dash, stateSeconds: 0 }, true, true, STEP_SECONDS);

    expect(stamina.value).toBe(0);
  });

  test("a spend restarts the rest, so the pool refills only once the delay has passed since it", () => {
    expect.hasAssertions();

    const stamina = createStamina(STAMINA_MAX);
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
