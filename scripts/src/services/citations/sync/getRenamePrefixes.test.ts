import { getRenamePrefixes } from "#src/services/citations/sync/getRenamePrefixes";
import { describe, expect, test } from "vitest";

describe(getRenamePrefixes, () => {
  test("reduces a moved file to the prefix that moved", () => {
    expect.hasAssertions();

    expect(getRenamePrefixes("R100\tapps/web/app/a/b/c.ts\tapps/web/app/x/b/c.ts\n")).toStrictEqual([
      { from: "apps/web/app/a", to: "apps/web/app/x" },
    ]);
  });

  test("keeps the whole path for a file renamed in place", () => {
    expect.hasAssertions();

    expect(getRenamePrefixes("R090\ta/c.ts\ta/d.ts\n")).toStrictEqual([{ from: "a/c.ts", to: "a/d.ts" }]);
  });

  // Every file of a moved directory reports the same prefix, and a citation is rewritten once
  test("dedupes the prefix a moved directory's files share", () => {
    expect.hasAssertions();

    expect(getRenamePrefixes("R100\ta/b/c.ts\tx/b/c.ts\nR100\ta/b/d.ts\tx/b/d.ts\n")).toStrictEqual([
      { from: "a", to: "x" },
    ]);
  });

  // Unrelated renames strip to the same prefix, which then names no one destination a citation of it could take
  test("keeps the file paths of a prefix two renames send to different places", () => {
    expect.hasAssertions();

    expect(getRenamePrefixes("R100\ta/b/c.ts\tx/b/c.ts\nR100\ta/d/e.ts\ty/d/e.ts\n")).toStrictEqual([
      { from: "a/b/c.ts", to: "x/b/c.ts" },
      { from: "a/d/e.ts", to: "y/d/e.ts" },
    ]);
  });

  test("ignores every status but a rename", () => {
    expect.hasAssertions();

    expect(getRenamePrefixes("M\ta/c.ts\nA\ta/d.ts\nD\ta/e.ts\nC100\ta/f.ts\ta/g.ts\n")).toStrictEqual([]);
  });
});
