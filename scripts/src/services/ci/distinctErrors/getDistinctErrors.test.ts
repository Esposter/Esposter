import { getDistinctErrors } from "#src/services/ci/distinctErrors/getDistinctErrors";
import { describe, expect, test } from "vitest";

describe(getDistinctErrors, () => {
  test("counts one error once per message, dropping the job and step columns and the lines that are not errors", () => {
    expect.hasAssertions();

    const log = [
      "build\tcheck\terror TS2322: Type 'a' is not assignable",
      "lint\tcheck\terror TS2322: Type 'a' is not assignable",
      "build\tcheck\tCompiling packages",
    ].join("\n");

    expect(getDistinctErrors(log)).toStrictEqual([{ count: 2, error: "error TS2322: Type 'a' is not assignable" }]);
  });
});
