import type { LoginGlide } from "#src/models/login/LoginGlide";

import { LoginStage } from "#src/models/login/LoginStage";
import { advanceLoginGlide } from "#src/services/login/scene/advanceLoginGlide";
import {
  LOGIN_GLIDE_ACCELERATION,
  LOGIN_GLIDE_PREPARING_SPEED,
  LOGIN_GLIDE_TITLE_SPEED,
  LOGIN_WALKWAY_ROW,
} from "#src/services/login/scene/constants";
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

  test("comes to rest on a whole number of the walkway's copies, never slowing faster than its acceleration", () => {
    expect.hasAssertions();

    const glides = run({ scrolled: 5, speed: LOGIN_GLIDE_PREPARING_SPEED }, LoginStage.Door, 20);
    const { scrolled = 0, speed } = glides.at(-1) ?? {};
    const decelerations = glides
      .slice(1)
      .map((glide, index) => ((glides[index]?.speed ?? 0) - glide.speed) / deltaSeconds);

    expect(speed).toBe(0);
    expect(scrolled % LOGIN_WALKWAY_ROW.length).toBe(0);
    expect(Math.max(...decelerations)).toBeLessThan(LOGIN_GLIDE_ACCELERATION * 1.05);
  });
});
