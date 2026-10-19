import { getCloneLineRange } from "#src/services/sweeps/duplicateCode/getCloneLineRange";
import { describe, expect, test } from "vitest";

describe(getCloneLineRange, () => {
  test("drops a first line the clone enters past its first token and a last line it leaves before its end", () => {
    expect.hasAssertions();

    expect(
      getCloneLineRange("const a = f();\nconst b = 1;\nconst c = 2;\nconst d = g();", {
        end: { column: 5, line: 4 },
        start: { column: 12, line: 1 },
      }),
    ).toStrictEqual({ endLine: 3, startLine: 2 });
  });

  test("keeps edge lines the clone covers whole, from their first token to their last", () => {
    expect.hasAssertions();

    expect(
      getCloneLineRange("  a();\n  b();", { end: { column: 6, line: 2 }, start: { column: 2, line: 1 } }),
    ).toStrictEqual({ endLine: 2, startLine: 1 });
  });

  test("drops the comment and blank lines left at either edge", () => {
    expect.hasAssertions();

    expect(
      getCloneLineRange("f();\n// Note\n\na();\nb();\n/* Other */\ng();", {
        end: { column: 1, line: 7 },
        start: { column: 2, line: 1 },
      }),
    ).toStrictEqual({ endLine: 5, startLine: 4 });
  });
});
