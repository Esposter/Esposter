import { checkSurveyExpression } from "#src/services/checkSurveyExpression";
import { describe, expect, test } from "vitest";

describe(checkSurveyExpression, () => {
  test("an unclosed parenthesis", () => {
    expect.hasAssertions();

    expect(checkSurveyExpression("({age} > 5")).toStrictEqual({
      message: "Expected ) to close the parenthesis opened here",
      position: 10,
    });
  });

  test("an unknown function", () => {
    expect.hasAssertions();

    expect(checkSurveyExpression("nosuchfunction({age})")).toStrictEqual({
      message: 'Unknown function "nosuchfunction"',
      position: 0,
    });
  });

  test("an unknown function is named at its first call in source order", () => {
    expect.hasAssertions();

    expect(checkSurveyExpression("nosuchouter(nosuchinner())")).toStrictEqual({
      message: 'Unknown function "nosuchouter"',
      position: 0,
    });
  });

  test("a source that calls no function is not refused", () => {
    expect.hasAssertions();

    expect(checkSurveyExpression("{age} > 5")).toBeUndefined();
  });

  test.each([
    ["an average's filter as its third argument", "avgInArray({m}, 'p', '{p} > 1')", "avgInArray", 0],
    ["a count's filter as its third argument", "countInArray({m}, 'p', '{p} > 1')", "countInArray", 0],
    ["a maximum's filter as its fourth argument", "maxInArray({m}, 'p', 'n', '{p} > 1')", "maxInArray", 0],
    ["a minimum's filter as its third argument", "1 + minInArray({m}, 'p', '{p} > 1')", "minInArray", 4],
    ["a sum's filter that is not a text", "sumInArray({m}, 'p', {q})", "sumInArray", 0],
  ])("%s is refused at the call", (_title, source, name, position) => {
    expect.hasAssertions();

    expect(checkSurveyExpression(source)).toStrictEqual({
      message: `The filter form of "${name}" is not supported`,
      position,
    });
  });

  test.each(["maxInArray({m}, 'p', 'name')", "countInArray({m}, 'p')", "sumInArray({m}, 'p')"])(
    "%s is not refused, since its third argument names a field or it has none",
    (source) => {
      expect.hasAssertions();

      expect(checkSurveyExpression(source)).toBeUndefined();
    },
  );
});
