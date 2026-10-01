import {
  LOGIN_WALKWAY_RISE_DEPTH,
  LOGIN_WALKWAY_RISE_OVERSHOOT,
  LOGIN_WALKWAY_SETTLED_DISTANCE,
  LOGIN_WALKWAY_SUNK_DISTANCE,
} from "#src/services/login/walkway/constants";
import { readLoginWalkwaySink } from "#src/services/login/walkway/readLoginWalkwaySink";
import { describe, expect, test } from "vitest";

describe(readLoginWalkwaySink, () => {
  // A seed in the middle of the stagger, so the rise spans the sunk and settled distances exactly
  const seed = 0.5;

  test("rises from its depth past its place by the overshoot and settles back into it", () => {
    expect.hasAssertions();

    const sinks = Array.from({ length: 401 }, (_, index) =>
      readLoginWalkwaySink(
        LOGIN_WALKWAY_SUNK_DISTANCE - ((LOGIN_WALKWAY_SUNK_DISTANCE - LOGIN_WALKWAY_SETTLED_DISTANCE) * index) / 400,
        seed,
      ),
    );

    expect(sinks[0]).toBeCloseTo(LOGIN_WALKWAY_RISE_DEPTH);
    expect(sinks.at(-1)).toBeCloseTo(0);
    expect(Math.min(...sinks)).toBeCloseTo(-LOGIN_WALKWAY_RISE_OVERSHOOT, 3);
  });
});
