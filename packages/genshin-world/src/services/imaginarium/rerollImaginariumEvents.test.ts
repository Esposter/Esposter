import { rerollImaginariumEvents } from "#src/services/imaginarium/rerollImaginariumEvents";
import { describe, expect, test } from "vitest";

describe(rerollImaginariumEvents, () => {
  test("an act's events are rerolled", () => {
    expect.hasAssertions();

    expect(rerollImaginariumEvents(["battle"], 1, () => ["companion", "blessing"])).toStrictEqual({
      events: ["companion", "blessing"],
      rerolls: 0,
    });
  });

  test("a reroll is refused with no rerolls left", () => {
    expect.hasAssertions();

    expect(rerollImaginariumEvents(["battle"], 0, () => ["companion", "blessing"])).toStrictEqual({
      events: ["battle"],
      rerolls: 0,
    });
  });
});
