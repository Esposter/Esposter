import { uncapitalize } from "#src/util/text/uncapitalize";
import { describe, expect, test } from "vitest";

describe(uncapitalize, () => {
  test("uncapitalizes", () => {
    expect.hasAssertions();

    expect(uncapitalize("")).toBe("");
    // Multi-character, so the tail is proven both preserved and left uncased.
    expect(uncapitalize("AA")).toBe("aA");
    expect(uncapitalize("a")).toBe("a");
    expect(uncapitalize("0")).toBe("0");
  });
});
