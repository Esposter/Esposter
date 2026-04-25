import { Flipped } from "@/models/Flipped";
import { parseTileId } from "@/util/parseTileId";
import { describe, expect, test } from "vitest";

describe(parseTileId, () => {
  test("strips flipped flags", () => {
    expect.hasAssertions();

    expect(parseTileId(0)).toBe(0);
    expect(parseTileId(0 | Flipped.Horizontally)).toBe(0);
    expect(parseTileId(0 | Flipped.Vertically)).toBe(0);
    expect(parseTileId(0 | Flipped.Diagonally)).toBe(0);
    expect(parseTileId(0 | Flipped.Horizontally | Flipped.Vertically | Flipped.Diagonally)).toBe(0);
    expect(parseTileId(1)).toBe(1);
    expect(parseTileId(1 | Flipped.Horizontally)).toBe(1);
    expect(parseTileId(1 | Flipped.Vertically)).toBe(1);
    expect(parseTileId(1 | Flipped.Diagonally)).toBe(1);
    expect(parseTileId(1 | Flipped.Horizontally | Flipped.Vertically | Flipped.Diagonally)).toBe(1);
  });
});
