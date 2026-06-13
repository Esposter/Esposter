import { getSection } from "@/checkDependencies/getSection";
import { describe, expect, test } from "vitest";

describe(getSection, () => {
  const text = "catalog:\n  a: b\n";

  test("extracts the indented body of a named top-level section", () => {
    expect.hasAssertions();

    expect(getSection("catalog", text)).toBe("  a: b\n");
  });

  test("returns an empty string when the section is missing", () => {
    expect.hasAssertions();

    expect(getSection("missing", text)).toBe("");
  });
});
