import type { SurveyLogicStoredValue } from "#src/models/SurveyLogicStoredValue";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicAnswer } from "#src/services/shared/toSurveyLogicAnswer";
import { describe, expect, test } from "vitest";

describe(toSurveyLogicAnswer, () => {
  test.each<[string, SurveyLogicStoredValue, SurveyLogicValue]>([
    ["reads a storage null at the top level as undefined", null, undefined],
    ["reads a null inside a list as undefined", [null], [undefined]],
    ["reads a null inside a record as undefined", { name: null }, { name: undefined }],
    ["keeps the value beside a null in a list", [null, 1], [undefined, 1]],
    [
      "reads a record field that holds a null as undefined, keeping the other fields",
      { age: 2, name: null },
      { age: 2, name: undefined },
    ],
    ["reads a null nested in a list in a record as undefined", { answers: [null] }, { answers: [undefined] }],
    ["reads a quoted text nested in a record as the text without its quotes", { q: "'hi'" }, { q: "hi" }],
    ["reads a boolean text nested in a record as the boolean", { flag: "true" }, { flag: true }],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(toSurveyLogicAnswer(value)).toStrictEqual(expected);
  });

  test.each<[string, string]>([
    ["keeps numeric text '5' as text, not as a number", "5"],
    ["keeps text with a leading space before its digits as text", " 7"],
    ["keeps text with a trailing space after a lone zero as text", "0 "],
    ["keeps text with a point and digits as text", "0.5"],
    ["keeps hexadecimal text as text", "0x1F"],
    ["keeps text with a leading zero as text", "007"],
    ["keeps a comma decimal as text", "1,5"],
  ])("%s", (_title, value) => {
    expect.hasAssertions();

    expect(toSurveyLogicAnswer(value)).toStrictEqual(value);
  });

  test.each<[string, string, boolean]>([
    ["reads the text TRUE in capitals as the boolean true", "TRUE", true],
    ["reads the text false in lower case as the boolean false", "false", false],
    ["reads the text True in title case as the boolean true", "True", true],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(toSurveyLogicAnswer(value)).toStrictEqual(expected);
  });

  test.each<[string, string, string]>([
    ["reads text in single quotes as the text without them", "'hi'", "hi"],
    ["reads text in double quotes as the text without them", '"hi"', "hi"],
    ["keeps a lone single quote as the quote itself", "'", "'"],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(toSurveyLogicAnswer(value)).toStrictEqual(expected);
  });

  test.each<[string, SurveyLogicStoredValue]>([
    ["passes a number through as the same number", 0.1],
    ["passes a negative number through as the same number", -1],
    ["passes true through as true", true],
    ["passes false through as false", false],
    ["passes an unanswered value through as undefined", undefined],
  ])("%s", (_title, value) => {
    expect.hasAssertions();

    expect(toSurveyLogicAnswer(value)).toStrictEqual(value);
  });
});
