import { capitalize } from "@/util/text/capitalize";
import { describe, expect, test } from "vitest";

describe(capitalize, () => {
  test("capitalizes", () => {
    expect.hasAssertions();

    expect(capitalize("")).toBe("");
    expect(capitalize("a")).toBe("A");
    expect(capitalize("A")).toBe("A");
    expect(capitalize("aa")).toBe("Aa");
  });
});
