import { MAX_SPEECH_UNIT_CHARACTERS } from "#src/services/constants";
import { getSpeechUnits } from "#src/services/getSpeechUnits";
import { describe, expect, test } from "vitest";

describe(getSpeechUnits, () => {
  // A sentence exactly the budget long, which fills a unit on its own
  const budget = `${"b".repeat(MAX_SPEECH_UNIT_CHARACTERS - 1)}.`;

  test.each([
    ["nothing", "", []],
    ["one sentence", "a.", ["a."]],
    ["the first sentence alone, then the rest packed", "a. b. c.", ["a.", "b. c."]],
    ["a sentence that would overflow the budget starts a unit", `a. ${budget} c.`, ["a.", budget, "c."]],
  ])("%s: reads in %s", (_case, prose, expected) => {
    expect.hasAssertions();

    expect(getSpeechUnits(prose)).toStrictEqual(expected);
  });
});
