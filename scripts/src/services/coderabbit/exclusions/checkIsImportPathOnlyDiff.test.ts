import { checkIsImportPathOnlyDiff } from "#src/services/coderabbit/exclusions/checkIsImportPathOnlyDiff";
import { describe, expect, test } from "vitest";

describe(checkIsImportPathOnlyDiff, () => {
  const header = ["diff --git a/x.ts b/x.ts", "--- a/x.ts", "+++ b/x.ts", "@@ -1,2 +1,2 @@"];
  const getDiff = (...changedLines: string[]) => [...header, ...changedLines, ""].join("\n");

  test("accepts the same imports pointing at a new module", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(
        getDiff(
          '-import { a } from "@/util/a";',
          '-import type { B } from "@/models/B";',
          '+import { a } from "#shared/util/a";',
          '+import type { B } from "#shared/models/B";',
        ),
      ),
    ).toBe(true);
  });

  test("rejects an added symbol the repathing smuggles in", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(getDiff('-import { a } from "@/util";', '+import { a, b } from "#shared/util";')),
    ).toBe(false);
  });

  test("rejects a changed line that is not an import", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(
        getDiff('-import { a } from "@/util";', '+import { a } from "#shared/util";', "-const x = 1;", "+const x = 2;"),
      ),
    ).toBe(false);
  });

  test("rejects a mode flip carried in the header", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(
        [
          "diff --git a/x.ts b/x.ts",
          "old mode 100644",
          "new mode 100755",
          ...header.slice(1),
          '-import { a } from "@/util";',
          '+import { a } from "#shared/util";',
          "",
        ].join("\n"),
      ),
    ).toBe(false);
  });

  test("rejects a reordered side-effect import", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(getDiff('-import "./a";', '-import "./b";', '+import "./b";', '+import "./a";')),
    ).toBe(false);
  });

  test("rejects a line carrying a second quoted value", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(
        getDiff(
          'import data from "./data.json" with { type: "json" };'.replace(/^/u, "-"),
          'import data from "./data.json" with { type: "text" };'.replace(/^/u, "+"),
        ),
      ),
    ).toBe(false);
  });

  test("rejects a diff with no changed lines", () => {
    expect.hasAssertions();

    expect(checkIsImportPathOnlyDiff(getDiff())).toBe(false);
  });
});
