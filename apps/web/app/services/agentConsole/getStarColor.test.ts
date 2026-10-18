import { GENSHIN_FIVE_STAR_COLOR, GENSHIN_FOUR_STAR_COLOR } from "@/services/agentConsole/constants";
import { getStarColor } from "@/services/agentConsole/getStarColor";
import { describe, expect, test } from "vitest";

describe(getStarColor, () => {
  test("a four-star pick falls in purple", () => {
    expect.hasAssertions();

    expect(getStarColor(4)).toBe(GENSHIN_FOUR_STAR_COLOR);
  });

  test("a five-star pick falls in gold", () => {
    expect.hasAssertions();

    expect(getStarColor(5)).toBe(GENSHIN_FIVE_STAR_COLOR);
  });
});
