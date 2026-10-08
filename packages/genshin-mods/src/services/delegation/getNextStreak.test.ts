import { describe, expect, test } from "vitest";

import { DelegationStep } from "../../models/DelegationStep";
import { getNextStreak } from "./getNextStreak";

describe(getNextStreak, () => {
  test.each([
    ["a lookup adds one", 2, DelegationStep.Lookup, 3],
    ["a reset clears the run", 2, DelegationStep.Reset, 0],
    ["a neutral call keeps it", 2, DelegationStep.Neutral, 2],
    ["the first lookup of a run", 0, DelegationStep.Lookup, 1],
  ])("%s", (_description, streak, step, expected) => {
    expect.hasAssertions();

    expect(getNextStreak(streak, step)).toStrictEqual(expected);
  });
});
