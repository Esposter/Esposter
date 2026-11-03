import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";
import { describe, expect, test } from "vitest";

describe(toSurveyLogicText, () => {
  test.each<[string, SurveyLogicValue, string]>([
    ["reads an unanswered value as nothing", undefined, ""],
    ["reads a null as nothing", null, ""],
    ["reads a record as nothing", { name: "Ada" }, ""],
    ["reads a number as its digits", 2.5, "2.5"],
    ["reads a boolean as its word", false, "false"],
    ["reads a text as itself", "red", "red"],
    ["joins the items of a list with a comma", [1, "a", true], "1,a,true"],
    ["joins a nested list flat", [[1, 2], 3], "1,2,3"],
    ["reads an unanswered item of a list as nothing", ["a", undefined], "a,"],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(toSurveyLogicText(value)).toBe(expected);
  });
});
