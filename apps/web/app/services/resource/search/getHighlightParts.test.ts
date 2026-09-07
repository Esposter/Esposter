import { getHighlightParts } from "@/services/resource/search/getHighlightParts";
import { describe, expect, test } from "vitest";

describe(getHighlightParts, () => {
  const text = "name";

  test("returns undefined for an empty query", () => {
    expect.hasAssertions();
    expect(getHighlightParts(text, "")).toBeUndefined();
  });

  test("returns undefined when there is no match", () => {
    expect.hasAssertions();
    expect(getHighlightParts(text, " ")).toBeUndefined();
  });

  test("splits around a case-insensitive match preserving original casing", () => {
    expect.hasAssertions();
    expect(getHighlightParts("Name", "nAM")).toStrictEqual({ match: "Nam", prefix: "", suffix: "e" });
  });

  test("splits around the first occurrence", () => {
    expect.hasAssertions();
    expect(getHighlightParts("name name", "ame")).toStrictEqual({ match: "ame", prefix: "n", suffix: " name" });
  });
});
