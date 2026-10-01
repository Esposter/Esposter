import type { LoginGlide } from "#src/models/login/LoginGlide";

import { LoginStage } from "#src/models/login/LoginStage";
import { advanceLoginGlide } from "#src/services/login/scene/advanceLoginGlide";
import {
  LOGIN_DOOR_REST_DISTANCE,
  LOGIN_GLIDE_ACCELERATION,
  LOGIN_GLIDE_PREPARING_SPEED,
  LOGIN_GLIDE_TITLE_SPEED,
  LOGIN_WALKWAY_ROW,
} from "#src/services/login/scene/constants";
import { LOGIN_WALKWAY_SUNK_DISTANCE } from "#src/services/login/walkway/constants";
import { describe, expect, test } from "vitest";

describe(advanceLoginGlide, () => {
  const deltaSeconds = 1 / 60;
  const run = (glide: LoginGlide, stage: LoginStage, seconds: number): LoginGlide[] =>
    Array.from({ length: Math.round(seconds / deltaSeconds) }).reduce<LoginGlide[]>(
      (glides) => [...glides, advanceLoginGlide(glides.at(-1) ?? glide, stage, deltaSeconds)],
      [glide],
    );

  test("gathers the preparing speed from the title's at the glide's acceleration", () => {
    expect.hasAssertions();

    const glides = run({ scrolled: 0, speed: LOGIN_GLIDE_TITLE_SPEED }, LoginStage.Preparing, 0.5);

    expect(glides.at(-1)?.speed).toBeCloseTo(LOGIN_GLIDE_TITLE_SPEED + LOGIN_GLIDE_ACCELERATION * 0.5);

    const settled = run(glides.at(-1) ?? { scrolled: 0, speed: 0 }, LoginStage.Preparing, 2);

    expect(settled.at(-1)?.speed).toBe(LOGIN_GLIDE_PREPARING_SPEED);
  });

  test("keeps its pace until the door reaches the walkway's far end, then slows evenly to rest on a whole copy", () => {
    expect.hasAssertions();

    const start = 5;
    const glides = run({ scrolled: start, speed: LOGIN_GLIDE_PREPARING_SPEED }, LoginStage.Door, 20);
    const { scrolled = 0, speed } = glides.at(-1) ?? {};
    const doorLead = LOGIN_WALKWAY_SUNK_DISTANCE - LOGIN_DOOR_REST_DISTANCE;
    const cruising = glides.filter((glide) => scrolled - glide.scrolled > doorLead);

    expect(speed).toBe(0);
    expect(scrolled % LOGIN_WALKWAY_ROW.length).toBe(0);
    // Never faster than the pace it had, and that pace held until the door rises
    expect(Math.max(...glides.map((glide) => glide.speed))).toBe(LOGIN_GLIDE_PREPARING_SPEED);
    expect(cruising.every((glide) => glide.speed === LOGIN_GLIDE_PREPARING_SPEED)).toBe(true);
    // The door first stands past the walkway's far end, so it rises there rather than over walkway already built
    expect(scrolled - start).toBeGreaterThanOrEqual(doorLead);
  });
});
