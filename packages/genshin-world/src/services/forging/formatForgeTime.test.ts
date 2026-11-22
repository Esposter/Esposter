import { formatForgeTime } from "#src/services/forging/formatForgeTime";
import { SECONDS_PER_MINUTE } from "#src/services/time/constants";
import { ENGLISH_GAME_TEXT, fillGameTextValues, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(formatForgeTime, () => {
  test.each([
    ["whole minutes in the game's minute words", 5 * SECONDS_PER_MINUTE, 5],
    ["a time under a minute as one minute, the game having no seconds unit", 5, 1],
  ])("reads %s", (_description, seconds, minutes) => {
    expect.hasAssertions();

    expect(formatForgeTime(ENGLISH_GAME_TEXT, seconds)).toBe(
      fillGameTextValues(ENGLISH_GAME_TEXT[GameTextKey.WishTimeRemainingMinutes], minutes),
    );
  });
});
