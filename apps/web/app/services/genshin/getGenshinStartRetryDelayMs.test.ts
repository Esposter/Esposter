import { GENSHIN_START_RETRY_BASE_DELAY_MS, GENSHIN_START_RETRY_MAX_DELAY_MS } from "@/services/genshin/constants";
import { getGenshinStartRetryDelayMs } from "@/services/genshin/getGenshinStartRetryDelayMs";
import { describe, expect, test } from "vitest";

describe(getGenshinStartRetryDelayMs, () => {
  test("doubles from the base with each failed attempt, and holds at the cap", () => {
    expect.hasAssertions();

    expect([0, 1, 2].map((attempt) => getGenshinStartRetryDelayMs(attempt))).toStrictEqual([
      GENSHIN_START_RETRY_BASE_DELAY_MS,
      GENSHIN_START_RETRY_BASE_DELAY_MS * 2,
      GENSHIN_START_RETRY_BASE_DELAY_MS * 4,
    ]);
    expect(getGenshinStartRetryDelayMs(20)).toBe(GENSHIN_START_RETRY_MAX_DELAY_MS);
  });
});
