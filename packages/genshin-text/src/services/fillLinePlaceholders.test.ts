import { TravelerGender } from "#src/models/TravelerGender";
import { fillLinePlaceholders } from "#src/services/fillLinePlaceholders";
import { describe, expect, test } from "vitest";

describe(fillLinePlaceholders, () => {
  test.each([
    [TravelerGender.Female, " bc"],
    [TravelerGender.Male, " ad"],
  ])("fills the nickname and keeps the %s word in either order", (gender, expected) => {
    expect.hasAssertions();

    expect(fillLinePlaceholders("{NICKNAME}{M#a}{F#b}{F#c}{M#d}", " ", gender)).toBe(expected);
  });
});
