import { TextSize } from "#src/models/TextSize";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { getWrappedLines } from "#src/services/export/getWrappedLines";
import { describe, expect, test } from "vitest";

const wrappedAt = (width: number) => ({ isWrapped: true, textSize: TextSize.Small, width });

describe(getWrappedLines, () => {
  // The width of one narrow character at the smallest size, in document units, which every width below is a multiple of
  const NARROW_WIDTH = getTextWidth("a", TextSize.Small);

  test("a word that would pass the width starts the next line", () => {
    expect.hasAssertions();

    expect(getWrappedLines("a b", wrappedAt(NARROW_WIDTH * 2))).toStrictEqual(["a", "b"]);
  });

  test("a line that fits its width exactly is kept whole", () => {
    expect.hasAssertions();

    expect(getWrappedLines("a b", wrappedAt(NARROW_WIDTH * 3))).toStrictEqual(["a b"]);
  });

  test("a word that fits a line of its own is not broken", () => {
    expect.hasAssertions();

    expect(getWrappedLines("aa bb", wrappedAt(NARROW_WIDTH * 2))).toStrictEqual(["aa", "bb"]);
  });

  test("a word wider than the width breaks where the width runs out", () => {
    expect.hasAssertions();

    expect(getWrappedLines("aaa", wrappedAt(NARROW_WIDTH * 2))).toStrictEqual(["aa", "a"]);
  });

  test("each newline breaks the text, whatever the width", () => {
    expect.hasAssertions();

    expect(getWrappedLines("a\nb", wrappedAt(NARROW_WIDTH * 10))).toStrictEqual(["a", "b"]);
  });

  test("an unwrapped text breaks only at its newlines, whatever its width", () => {
    expect.hasAssertions();

    expect(
      getWrappedLines("a b\nc", { isWrapped: false, textSize: TextSize.Small, width: NARROW_WIDTH }),
    ).toStrictEqual(["a b", "c"]);
  });

  test("an empty text is one empty line", () => {
    expect.hasAssertions();

    expect(getWrappedLines("", wrappedAt(NARROW_WIDTH))).toStrictEqual([""]);
  });
});
