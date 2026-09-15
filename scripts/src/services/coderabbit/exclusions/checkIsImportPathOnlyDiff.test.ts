import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

import { checkIsImportPathOnlyDiff } from "#src/services/coderabbit/exclusions/checkIsImportPathOnlyDiff";
import { describe, expect, test } from "vitest";

describe(checkIsImportPathOnlyDiff, () => {
  const header = ["diff --git a/x.ts b/x.ts", "--- a/x.ts", "+++ b/x.ts", "@@ -1,2 +1,2 @@"];
  const getDiff = (...changedLines: string[]) => [...header, ...changedLines, ""].join("\n");
  // The moves the same range carries, which every repathed import must follow
  const rows: NameStatusRow[] = [
    { path: "apps/web/shared/util/a.ts", renamedFrom: "apps/web/app/util/a.ts", status: "R100" },
    { path: "apps/web/shared/models/B.ts", renamedFrom: "apps/web/app/models/B.ts", status: "R100" },
    { path: "apps/web/shared/util/index.ts", renamedFrom: "apps/web/app/util/index.ts", status: "R100" },
    { path: "x.ts", status: "M" },
  ];

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
        rows,
      ),
    ).toBe(true);
  });

  test("accepts a directory import following its index", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(getDiff('-import { a } from "@/util";', '+import { a } from "#shared/util";'), rows),
    ).toBe(true);
  });

  test("rejects a specifier swapped to a module the range did not move", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(
        getDiff('-import { a } from "@/util/a";', '+import { a } from "#shared/util/b";'),
        rows,
      ),
    ).toBe(false);
  });

  // Each end of the repathing names a rename the range carries, but they are two different renames: the import
  // Reads as followed while it now loads a module it never named
  test("rejects a specifier repointed from one rename's source to another's destination", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(
        getDiff('-import { a } from "@/util/a";', '+import { a } from "#shared/models/B";'),
        rows,
      ),
    ).toBe(false);
  });

  // Two modules renamed past each other move both ways at once, so a specifier names one rename's source and the
  // Other's destination — the import reads as followed while it now resolves to the other module's contents
  test("rejects a specifier naming both ends of two crossed renames", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(getDiff('-import { a } from "@/util/a";', '+import { a } from "#shared/util/a";'), [
        { path: "apps/web/shared/util/b.ts", renamedFrom: "apps/web/app/util/a.ts", status: "R100" },
        { path: "apps/web/shared/util/a.ts", renamedFrom: "apps/web/app/util/b.ts", status: "R100" },
      ]),
    ).toBe(false);
  });

  test("rejects a repathing in a range carrying no rename", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(getDiff('-import { a } from "@/util/a";', '+import { a } from "#shared/util/a";'), [
        { path: "x.ts", status: "M" },
      ]),
    ).toBe(false);
  });

  test("rejects an added symbol the repathing smuggles in", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(
        getDiff('-import { a } from "@/util/a";', '+import { a, b } from "#shared/util/a";'),
        rows,
      ),
    ).toBe(false);
  });

  test("rejects a changed line that is not an import", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(
        getDiff(
          '-import { a } from "@/util/a";',
          '+import { a } from "#shared/util/a";',
          "-const x = 1;",
          "+const x = 2;",
        ),
        rows,
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
          '-import { a } from "@/util/a";',
          '+import { a } from "#shared/util/a";',
          "",
        ].join("\n"),
        rows,
      ),
    ).toBe(false);
  });

  test("rejects a reordered side-effect import", () => {
    expect.hasAssertions();

    expect(
      checkIsImportPathOnlyDiff(getDiff('-import "./a";', '-import "./b";', '+import "./b";', '+import "./a";'), rows),
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
        rows,
      ),
    ).toBe(false);
  });

  test("rejects a diff with no changed lines", () => {
    expect.hasAssertions();

    expect(checkIsImportPathOnlyDiff(getDiff(), rows)).toBe(false);
  });
});
