import { charset } from "#src/services/mime/charset";
import { DEFAULT_TEXT_CHARSET } from "#src/services/mime/constants";
import { describe, expect, test } from "vitest";

describe(charset, () => {
  test.each([
    "application/json",
    "application/json; foo=bar",
    "application/javascript",
    "application/JavaScript",
    "text/html",
    "TEXT/HTML",
    "text/x-bogus",
  ])("returns UTF-8 for %j", (input) => {
    expect.hasAssertions();
    expect(charset(input)).toBe(DEFAULT_TEXT_CHARSET);
  });

  test.each(["application/x-bogus", "application/octet-stream", ""])("returns false for %j", (input) => {
    expect.hasAssertions();
    expect(charset(input)).toBe(false);
  });
});
