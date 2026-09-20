import { MAX_SPINNER_TIP_LENGTH } from "#src/services/constants";
import { cutSpinnerTip } from "#src/services/cutSpinnerTip";
import { describe, expect, test } from "vitest";

describe(cutSpinnerTip, () => {
  const sentence = "a.";
  const filler = "b".repeat(MAX_SPINNER_TIP_LENGTH);

  test.each([
    ["a line that fits", filler, filler],
    ["a line one over, at the last sentence that fits", `${sentence} ${sentence} ${filler}`, `${sentence} ${sentence}`],
    ["a line one over with no sentence end inside the limit", `${filler}b`, ""],
  ])("%s", (_case, text, expected) => {
    expect.hasAssertions();

    expect(cutSpinnerTip(text)).toBe(expected);
  });
});
