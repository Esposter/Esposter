import { TEXT_CHARACTER_WIDTH } from "#src/services/export/constants";
import { getWrappedLines } from "#src/services/export/getWrappedLines";
import { describe, expect, test } from "vitest";

describe(getWrappedLines, () => {
  test("a word that would pass the width starts the next line", () => {
    expect.hasAssertions();

    expect(getWrappedLines("a b", TEXT_CHARACTER_WIDTH * 2)).toStrictEqual(["a", "b"]);
  });

  test("a line that fits its width exactly is kept whole", () => {
    expect.hasAssertions();

    expect(getWrappedLines("a b", TEXT_CHARACTER_WIDTH * 3)).toStrictEqual(["a b"]);
  });

  test("a word that fits a line of its own is not broken", () => {
    expect.hasAssertions();

    expect(getWrappedLines("aa bb", TEXT_CHARACTER_WIDTH * 2)).toStrictEqual(["aa", "bb"]);
  });

  test("a word wider than the width breaks where the width runs out", () => {
    expect.hasAssertions();

    expect(getWrappedLines("aaa", TEXT_CHARACTER_WIDTH * 2)).toStrictEqual(["aa", "a"]);
  });

  test("each newline breaks the text, whatever the width", () => {
    expect.hasAssertions();

    expect(getWrappedLines("a\nb", TEXT_CHARACTER_WIDTH * 10)).toStrictEqual(["a", "b"]);
  });

  test("an empty text is one empty line", () => {
    expect.hasAssertions();

    expect(getWrappedLines("", TEXT_CHARACTER_WIDTH)).toStrictEqual([""]);
  });
});
