import { getCodeSpans } from "#src/services/identifiers/rename/getCodeSpans";
import { describe, expect, test } from "vitest";

describe(getCodeSpans, () => {
  test("leaves out strings, comments and template text, and keeps a template's expressions at any depth", () => {
    expect.hasAssertions();

    const text = 'a"b"a//b\na/*b*/a`b${a`b${a}`}b`a';

    expect(getCodeSpans(text).map(([start, end]) => text.slice(start, end))).toStrictEqual([
      "a",
      "a",
      "\na",
      "a",
      "a",
      "a",
      "a",
    ]);
  });
});
