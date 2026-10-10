import { formatMillions } from "#src/services/usage/formatMillions";
import { describe, expect, test } from "vitest";

describe(formatMillions, () => {
  test.each([
    [0, "0.0M"],
    [2_417_600_000, "2417.6M"],
  ])("%s tokens read as %s", (tokens, formatted) => {
    expect.hasAssertions();

    expect(formatMillions(tokens)).toBe(formatted);
  });
});
