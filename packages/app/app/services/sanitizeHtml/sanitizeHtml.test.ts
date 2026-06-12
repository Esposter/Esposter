import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { describe, expect, test } from "vitest";

describe(sanitizeHtml, () => {
  test("adds full-width collapsed border styles to tables", () => {
    expect.hasAssertions();

    expect(sanitizeHtml("<table></table>")).toBe(`<table style="width:100%; border-collapse: collapse;"></table>`);
  });

  test("converts td align attribute to text-align style", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<table><tr><td align="center">x</td></tr></table>`)).toBe(
      `<table style="width:100%; border-collapse: collapse;"><tr><td style="text-align:center">x</td></tr></table>`,
    );
  });

  test("converts th align attribute to text-align style", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<table><tr><th align="right">x</th></tr></table>`)).toBe(
      `<table style="width:100%; border-collapse: collapse;"><tr><th style="text-align:right">x</th></tr></table>`,
    );
  });

  test("strips script tags and their content", () => {
    expect.hasAssertions();

    expect(sanitizeHtml("<p>hi</p><script>alert(1)</script>")).toBe("<p>hi</p>");
  });
});
