import { escapeXml } from "#shared/util/text/escapeXml";
import { describe, expect, test } from "vitest";

describe(escapeXml, () => {
  test("escapes the characters that read as markup", () => {
    expect.hasAssertions();

    expect(escapeXml("&<>")).toBe("&amp;&lt;&gt;");
  });

  test("leaves quotes and plain text unchanged", () => {
    expect.hasAssertions();

    expect(escapeXml(`"'a`)).toBe(`"'a`);
  });
});
