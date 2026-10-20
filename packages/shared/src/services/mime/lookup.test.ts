import { lookup } from "#src/services/mime/lookup";
import { describe, expect, test } from "vitest";

describe(lookup, () => {
  test.each([
    { expected: "text/html", input: ".html" },
    { expected: "text/javascript", input: ".js" },
    { expected: "application/json", input: ".json" },
    { expected: "application/rtf", input: ".rtf" },
    { expected: "text/plain", input: ".txt" },
    { expected: "application/xml", input: ".xml" },
    { expected: "video/mp4", input: ".mp4" },
    { expected: "text/html", input: "html" },
    { expected: "application/xml", input: "xml" },
    { expected: "text/html", input: "HTML" },
    { expected: "application/xml", input: ".Xml" },
  ])("resolves the extension $input to $expected", ({ expected, input }) => {
    expect.hasAssertions();
    expect(lookup(input)).toBe(expected);
  });

  test.each([".bogus", "bogus", "", "constructor"])("returns false for the unknown extension %s", (input) => {
    expect.hasAssertions();
    expect(lookup(input)).toBe(false);
  });

  test.each([
    { expected: "text/html", input: "page.html" },
    { expected: "text/html", input: "path/to/page.html" },
    { expected: "text/html", input: String.raw`path\to\page.html` },
    { expected: "text/html", input: "/path/to/page.html" },
    { expected: "text/html", input: String.raw`C:\path\to\page.html` },
    { expected: "text/html", input: "/path/to/PAGE.HTML" },
    { expected: "text/html", input: String.raw`C:\path\to\PAGE.HTML` },
  ])("resolves the path $input to $expected", ({ expected, input }) => {
    expect.hasAssertions();
    expect(lookup(input)).toBe(expected);
  });

  test("returns false for a path whose extension is unknown", () => {
    expect.hasAssertions();
    expect(lookup("/path/to/file.bogus")).toBe(false);
  });

  test("returns false for a path whose last segment has no extension", () => {
    expect.hasAssertions();
    expect(lookup("/path/to/json")).toBe(false);
  });

  // A dotfile's leading dot names the file, not an extension, unless a second dot follows it
  test.each([
    { expected: false, input: "/path/to/.json" },
    { expected: "application/json", input: "/path/to/.config.json" },
    { expected: "application/json", input: ".config.json" },
  ])("resolves the dotfile path $input to $expected", ({ expected, input }) => {
    expect.hasAssertions();
    expect(lookup(input)).toBe(expected);
  });
});
