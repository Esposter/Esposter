import { getPageSearchItems } from "@/services/resource/search/getPageSearchItems";
import { PageSearchItems } from "@/services/resource/search/PageSearchItems";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getPageSearchItems, () => {
  test("returns every page for an empty query", () => {
    expect.hasAssertions();
    expect(getPageSearchItems("")).toStrictEqual([...PageSearchItems]);
  });

  test("matches the page title case-insensitively", () => {
    expect.hasAssertions();
    expect(getPageSearchItems("HOME")).toStrictEqual([takeOne([...PageSearchItems], 0)]);
  });

  test("returns no items when nothing matches", () => {
    expect.hasAssertions();
    expect(getPageSearchItems("-1")).toStrictEqual([]);
  });
});
