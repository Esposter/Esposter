import { capitalize } from "@/util/text/capitalize";
import { describe, expect, test } from "vitest";

describe(capitalize, () => {
  test("capitalizes", () => {
    expect.hasAssertions();

    expect(capitalize("")).toBe("");
    // Multi-character, so the tail is proven both preserved and left uncased.
    expect(capitalize("aa")).toBe("Aa");
    expect(capitalize("A")).toBe("A");
    expect(capitalize("0")).toBe("0");
  });
});
