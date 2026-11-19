import { useWorldClock } from "#src/composables/useWorldClock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useWorldClock, () => {
  const OFFSET_MILLISECONDS = 120_000;

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Temporal"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("the world's time follows the offset as it is measured again", () => {
    expect.hasAssertions();

    let offsetMilliseconds = 0;
    const { getWorldNow } = useWorldClock(() => offsetMilliseconds);
    const before = getWorldNow();
    offsetMilliseconds = OFFSET_MILLISECONDS;

    expect(before.epochMilliseconds).toBe(0);
    expect(getWorldNow().epochMilliseconds).toBe(120_000);
  });
});
