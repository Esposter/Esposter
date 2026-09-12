import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { describe, expect, test } from "vitest";

describe(getSection, () => {
  const text = "catalog:\n  a: b\n";

  test("extracts the indented body of a named top-level section", () => {
    expect.hasAssertions();

    expect(getSection("catalog", text)).toBe("  a: b\n");
  });

  test("extracts the body of a section a CRLF file declares", () => {
    expect.hasAssertions();

    expect(getSection("catalog", text.replaceAll("\n", "\r\n"))).toBe("  a: b\r\n");
  });

  test("returns an empty string when the section is missing", () => {
    expect.hasAssertions();

    expect(getSection("missing", text)).toBe("");
  });
});
