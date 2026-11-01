import { useWorldClock } from "#src/composables/useWorldClock";
import { describe, expect, test } from "vitest";

describe(useWorldClock, () => {
  const OFFSET_MILLISECONDS = 120_000;

  test("the world's time follows the offset as it is measured again", () => {
    expect.hasAssertions();

    let offsetMilliseconds = 0;
    const { getWorldNow } = useWorldClock(() => offsetMilliseconds);
    const before = getWorldNow();
    offsetMilliseconds = OFFSET_MILLISECONDS;

    expect(getWorldNow().epochMilliseconds).toBeGreaterThanOrEqual(before.epochMilliseconds + OFFSET_MILLISECONDS);
  });
});
