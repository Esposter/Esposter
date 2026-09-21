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

  // A script that puts no white space after a sentence still has its line cut rather than dropped whole, which is
  // What every localized line longer than the tool reads depends on
  test.each(["。", "！", "？"])("cuts a line at the fullwidth terminator %j", (terminator) => {
    expect.hasAssertions();

    expect(cutSpinnerTip(`一${terminator}${"二".repeat(MAX_SPINNER_TIP_LENGTH)}`)).toBe(`一${terminator}`);
  });
});
