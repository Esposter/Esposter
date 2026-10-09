import { ComparisonFailureRecovery } from "#src/models/genshinParity/reference/ComparisonFailureRecovery";
import { classifyComparisonFailure } from "#src/services/genshinParity/reference/classifyComparisonFailure";
import { describe, expect, test } from "vitest";

describe(classifyComparisonFailure, () => {
  test("relaunches and continues on a page, context or browser that has been closed", () => {
    expect.hasAssertions();

    expect(classifyComparisonFailure("page.evaluate: Target page, context or browser has been closed")).toStrictEqual(
      ComparisonFailureRecovery.RelaunchAndContinue,
    );
  });

  test("relaunches and continues on a page that crashed", () => {
    expect.hasAssertions();

    expect(classifyComparisonFailure("Target crashed")).toStrictEqual(ComparisonFailureRecovery.RelaunchAndContinue);
  });

  test("keeps the browser for a failure of the reference's own input", () => {
    expect.hasAssertions();

    expect(classifyComparisonFailure("ENOENT: no such file or directory")).toStrictEqual(
      ComparisonFailureRecovery.MissingInput,
    );
  });
});
