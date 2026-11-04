import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";

import { MAX_SURVEY_EXPRESSION_LENGTH } from "#src/services/constants";
import { runSurveyExpression } from "#src/services/runSurveyExpression";
import { err, ok } from "neverthrow";
import { describe, expect, test } from "vitest";

describe(runSurveyExpression, () => {
  const now = new Date(0);

  test("comparison and logic over answers", () => {
    expect.hasAssertions();

    const context: SurveyLogicContext = { now, scopes: {}, values: { age: 30, name: "Ada" } };

    expect(runSurveyExpression("{age} >= 18 and {name} = 'Ada'", context)).toStrictEqual(ok(true));
  });

  test("a source at the length limit of chained terms evaluates", () => {
    expect.hasAssertions();

    const context: SurveyLogicContext = { now, scopes: {}, values: {} };
    // Each `1+` is a term and the closing `11` the last, so the source is the limit's length and sums to 1010
    const source = `${"1+".repeat(MAX_SURVEY_EXPRESSION_LENGTH / 2 - 1)}11`;

    expect(runSurveyExpression(source, context)).toStrictEqual(ok(1010));
  });

  test("a malformed source is refused with the error of its parse", () => {
    expect.hasAssertions();

    const context: SurveyLogicContext = { now, scopes: {}, values: { age: 30 } };

    expect(runSurveyExpression("({age} > 5", context)).toStrictEqual(
      err({ message: "Expected ) to close the parenthesis opened here", position: 10 }),
    );
  });
});
