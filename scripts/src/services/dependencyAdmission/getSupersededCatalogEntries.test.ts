import { getSupersededCatalogEntries } from "#src/services/dependencyAdmission/getSupersededCatalogEntries";
import { describe, expect, test } from "vitest";

describe(getSupersededCatalogEntries, () => {
  test("names the successor of each catalog entry the map supersedes", () => {
    expect.hasAssertions();

    expect(
      getSupersededCatalogEntries(["a", "b"], { a: { source: "https://example.com/a", successor: "c" } }),
    ).toStrictEqual(["a is superseded by c (https://example.com/a)"]);
  });

  test("returns nothing when the catalog lists no superseded key", () => {
    expect.hasAssertions();

    expect(getSupersededCatalogEntries(["a"], {})).toStrictEqual([]);
  });
});
