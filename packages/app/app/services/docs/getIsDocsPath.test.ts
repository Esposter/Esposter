import { getIsDocsPath } from "@/services/docs/getIsDocsPath";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getIsDocsPath, () => {
  test.each([RoutePath.Docs, `${RoutePath.Docs}/architecture`, `${RoutePath.Docs}/architecture/auth`])(
    "%s is inside the docs tree",
    (path) => {
      expect.hasAssertions();

      expect(getIsDocsPath(path)).toBe(true);
    },
  );

  // The index is what a docs page navigates to when the reader leaves, and the prefix match is what would read
  // A route merely starting with those characters as a docs page
  test.each([RoutePath.Index, "/docsomething", "/messages", ""])("%s is outside it", (path) => {
    expect.hasAssertions();

    expect(getIsDocsPath(path)).toBe(false);
  });
});
