import { TALK_REVEAL_MS_PER_CHARACTER } from "#src/services/dialogue/constants";
import { getTalkRevealedLength } from "#src/services/dialogue/getTalkRevealedLength";
import { describe, expect, test } from "vitest";

describe(getTalkRevealedLength, () => {
  test("shows a space with the character before it, taking no time of its own", () => {
    expect.hasAssertions();

    expect(getTalkRevealedLength("ab cd", 2 * TALK_REVEAL_MS_PER_CHARACTER)).toBe(3);
  });

  test("is whole once the last character is written", () => {
    expect.hasAssertions();

    expect(getTalkRevealedLength("ab cd", 4 * TALK_REVEAL_MS_PER_CHARACTER)).toBe(5);
  });
});
