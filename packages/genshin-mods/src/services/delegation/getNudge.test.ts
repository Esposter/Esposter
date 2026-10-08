import { describe, expect, test } from "vitest";

import { DELEGATION_NUDGE } from "../constants";
import { getNudge } from "./getNudge";

describe(getNudge, () => {
  test.each([
    ["no lookup yet", 0, undefined],
    ["a lookup short of the third", 2, undefined],
    ["the third lookup", 3, DELEGATION_NUDGE],
    ["a lookup past the third", 4, undefined],
    ["the sixth lookup", 6, DELEGATION_NUDGE],
  ])("nudges for %s by its count %s", (_description, streak, expected) => {
    expect.hasAssertions();

    expect(getNudge(streak)).toStrictEqual(expected);
  });
});
