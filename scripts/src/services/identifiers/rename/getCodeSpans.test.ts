/* oxlint-disable no-template-curly-in-string -- the fixtures are source text holding a template literal */
import { getCodeSpans } from "#src/services/identifiers/rename/getCodeSpans";
import { describe, expect, test } from "vitest";

describe(getCodeSpans, () => {
  test("leaves out strings, comments and template text, and keeps a template's expressions at any depth", () => {
    expect.hasAssertions();

    // oxlint-disable-next-line no-template-curly-in-string -- A fixture of source text, whose template literal is the code under test
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
