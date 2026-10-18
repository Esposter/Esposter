import { stepTimeDialAdvance } from "#src/services/menu/stepTimeDialAdvance";
import { MINUTES_PER_DAY } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(stepTimeDialAdvance, () => {
  test("a full turn of the dial adds a day", () => {
    expect.hasAssertions();

    const pointerAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI];
    const advance = pointerAngles
      .slice(1)
      .reduce(
        (advanceMinutes, angle, index) => stepTimeDialAdvance(advanceMinutes, pointerAngles[index] ?? 0, angle),
        0,
      );

    expect(advance).toBe(MINUTES_PER_DAY);
  });
});
