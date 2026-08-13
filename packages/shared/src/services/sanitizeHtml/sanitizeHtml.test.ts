import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { describe, expect, test } from "vitest";

describe(sanitizeHtml, () => {
  const tableStyle = `style="width:100%;border-collapse:collapse"`;

  test("adds full-width collapsed border styles to tables", () => {
    expect.hasAssertions();

    expect(sanitizeHtml("<table></table>")).toBe(`<table ${tableStyle}></table>`);
  });

  // Td and th share one transformer, so the pair is the matrix rather than two tests
  test.each([["td"], ["th"]])("converts the %s align attribute to a text-align style", (cell) => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<table><tr><${cell} align="center">x</${cell}></tr></table>`)).toBe(
      `<table ${tableStyle}><tr><${cell} style="text-align:center">x</${cell}></tr></table>`,
    );
  });

  // The append path: every added declaration keeps whatever style the tag already carried
  test("keeps an existing style when adding the text-align", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<table><tr><td style="color:red" align="center">x</td></tr></table>`)).toBe(
      `<table ${tableStyle}><tr><td style="color:red;text-align:center">x</td></tr></table>`,
    );
  });

  test("strips script tags and their content", () => {
    expect.hasAssertions();

    expect(sanitizeHtml("<p>hi</p><script>alert(1)</script>")).toBe("<p>hi</p>");
  });
});
