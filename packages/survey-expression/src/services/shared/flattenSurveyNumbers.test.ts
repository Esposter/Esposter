import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { flattenSurveyNumbers } from "#src/services/shared/flattenSurveyNumbers";
import { describe, expect, test } from "vitest";

describe(flattenSurveyNumbers, () => {
  test.each<[string, SurveyLogicValue[], number[]]>([
    ["keeps a number, zero included", [0], [0]],
    ["keeps a text that reads as a number once trimmed", [" 0.1 "], [0.1]],
    ["drops an empty text", [""], []],
    ["drops a text that is not a number", ["a"], []],
    ["drops a boolean", [true], []],
    ["drops a record without reading its values", [{ k: -1 }], []],
    ["drops a list whose items read as no number", [["a", false]], []],
    ["flattens nested lists before the test", [[-1, [0.1, "a"]]], [-1, 0.1]],
  ])("%s", (_title, values, expected) => {
    expect.hasAssertions();

    expect(flattenSurveyNumbers(values)).toStrictEqual(expected);
  });
});
