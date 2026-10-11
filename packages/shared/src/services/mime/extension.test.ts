import { extension } from "#src/services/mime/extension";
import { describe, expect, test } from "vitest";

describe(extension, () => {
  test.each(["text/html", " text/html", "text/html "])("returns the extension of %j", (input) => {
    expect.hasAssertions();
    expect(extension(input)).toBe("html");
  });

  test.each([
    "text/html;charset=UTF-8",
    "text/HTML; charset=UTF-8",
    "text/html; charset=UTF-8",
    "text/html; charset=UTF-8 ",
    "text/html ; charset=UTF-8",
  ])("returns the extension of the media type in %j", (input) => {
    expect.hasAssertions();
    expect(extension(input)).toBe("html");
  });

  test.each(["application/x-bogus", "bogus", "", "constructor"])("returns false for %j", (input) => {
    expect.hasAssertions();
    expect(extension(input)).toBe(false);
  });
});
