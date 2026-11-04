import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";

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

  test("a malformed source is refused with the error of its parse", () => {
    expect.hasAssertions();

    const context: SurveyLogicContext = { now, scopes: {}, values: { age: 30 } };

    expect(runSurveyExpression("({age} > 5", context)).toStrictEqual(
      err({ message: "Expected ) to close the parenthesis opened here", position: 10 }),
    );
  });
});
