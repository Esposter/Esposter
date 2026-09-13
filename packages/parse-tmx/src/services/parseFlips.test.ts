import { Flipped } from "#src/models/Flipped";
import { parseFlips } from "#src/services/parseFlips";
import { describe, expect, test } from "vitest";

describe(parseFlips, () => {
  const gid = 1;

  test("parses an unflipped tile", () => {
    expect.hasAssertions();

    expect(parseFlips(gid)).toStrictEqual({ Diagonal: false, Horizontal: false, Vertical: false });
  });

  test("parses each flip", () => {
    expect.hasAssertions();

    expect(parseFlips(Flipped.Diagonally | gid)).toStrictEqual({
      Diagonal: true,
      Horizontal: false,
      Vertical: false,
    });
    expect(parseFlips(Flipped.Horizontally | gid)).toStrictEqual({
      Diagonal: false,
      Horizontal: true,
      Vertical: false,
    });
    expect(parseFlips(Flipped.Vertically | gid)).toStrictEqual({
      Diagonal: false,
      Horizontal: false,
      Vertical: true,
    });
  });
});
