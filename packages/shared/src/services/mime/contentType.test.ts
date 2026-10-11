import { contentType } from "#src/services/mime/contentType";
import { describe, expect, test } from "vitest";

describe(contentType, () => {
  test.each([
    { expected: "text/html; charset=utf-8", input: "html" },
    { expected: "text/html; charset=utf-8", input: ".html" },
    { expected: "text/jade; charset=utf-8", input: "jade" },
    { expected: "application/json; charset=utf-8", input: "json" },
  ])("returns the content type of the extension $input", ({ expected, input }) => {
    expect.hasAssertions();
    expect(contentType(input)).toBe(expected);
  });

  test.each(["bogus", ""])("returns false for the unknown extension %j", (input) => {
    expect.hasAssertions();
    expect(contentType(input)).toBe(false);
  });

  test.each([
    { expected: "application/json; charset=utf-8", input: "application/json" },
    { expected: "application/json; foo=bar; charset=utf-8", input: "application/json; foo=bar" },
    { expected: "TEXT/HTML; charset=utf-8", input: "TEXT/HTML" },
    { expected: "text/html; charset=utf-8", input: "text/html" },
    { expected: "text/html; charset=iso-8859-1", input: "text/html; charset=iso-8859-1" },
    { expected: "application/x-bogus", input: "application/x-bogus" },
  ])("returns the content type of the media type $input as $expected", ({ expected, input }) => {
    expect.hasAssertions();
    expect(contentType(input)).toBe(expected);
  });

  test("#209 attaches the charset when a parameter only contains the word charset", () => {
    expect.hasAssertions();
    expect(contentType("application/json; x-charset=foo")).toBe("application/json; x-charset=foo; charset=utf-8");
  });
});
