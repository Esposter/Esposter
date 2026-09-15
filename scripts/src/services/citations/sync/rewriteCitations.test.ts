import { rewriteCitations } from "#src/services/citations/sync/rewriteCitations";
import { describe, expect, test } from "vitest";

describe(rewriteCitations, () => {
  test("rewrites a citation of the moved prefix and of every path under it, and nothing else", () => {
    expect.hasAssertions();

    expect(rewriteCitations("`a` and `a/b.ts` but not `ab/c.ts` or `a b`", [{ from: "a", to: "x" }])).toBe(
      "`x` and `x/b.ts` but not `ab/c.ts` or `a b`",
    );
  });

  test("rewrites the app-relative spelling of a move inside apps/web", () => {
    expect.hasAssertions();

    expect(
      rewriteCitations("`app/a.ts` and `apps/web/app/a.ts`", [{ from: "apps/web/app/a.ts", to: "apps/web/app/b.ts" }]),
    ).toBe("`app/b.ts` and `apps/web/app/b.ts`");
  });

  // No short form reaches a path outside the app, so the citation gains the root it now needs
  test("writes the full path when the target leaves apps/web", () => {
    expect.hasAssertions();

    expect(rewriteCitations("`shared/a.ts`", [{ from: "apps/web/shared/a.ts", to: "a/a.ts" }])).toBe("`a/a.ts`");
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
});
