import { rewriteCitations } from "#src/services/citations/sync/rewriteCitations";
import { describe, expect, test } from "vitest";

describe(rewriteCitations, () => {
  test("rewrites a citation of the moved prefix and of every path under it", () => {
    expect.hasAssertions();

    expect(rewriteCitations("`a` and `a/b.ts` but not `ab/c.ts`", [{ from: "a", to: "x" }])).toBe(
      "`x` and `x/b.ts` but not `ab/c.ts`",
    );
  });

  test("rewrites the app-relative spelling of a move inside apps/web", () => {
    expect.hasAssertions();

    expect(
      rewriteCitations("`app/store/a.ts` and `apps/web/app/store/a.ts`", [
        { from: "apps/web/app/store/a.ts", to: "apps/web/app/store/b.ts" },
      ]),
    ).toBe("`app/store/b.ts` and `apps/web/app/store/b.ts`");
  });

  // No short form reaches a path outside the app, so the citation gains the root it now needs
  test("writes the full path when the target leaves apps/web", () => {
    expect.hasAssertions();

    expect(
      rewriteCitations("`shared/models/a.ts`", [
        { from: "apps/web/shared/models/a.ts", to: "packages/shared/src/a.ts" },
      ]),
    ).toBe("`packages/shared/src/a.ts`");
  });

  // The file's own rename is the longer prefix and wins over the directory move that also covers it
  test("applies the longest matching prefix", () => {
    expect.hasAssertions();

    expect(
      rewriteCitations("`a/b.ts` `a/c.ts`", [
        { from: "a", to: "x" },
        { from: "a/b.ts", to: "y/b.ts" },
      ]),
    ).toBe("`y/b.ts` `x/c.ts`");
  });

  test("leaves a token that is not a cited path alone", () => {
    expect.hasAssertions();

    expect(rewriteCitations("`useQuery` and `a b`", [{ from: "a", to: "x" }])).toBe("`useQuery` and `a b`");
  });
});
