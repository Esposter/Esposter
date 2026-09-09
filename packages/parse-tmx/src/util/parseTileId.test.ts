import { Flipped } from "#src/models/Flipped";
import { parseTileId } from "#src/util/parseTileId";
import { describe, expect, test } from "vitest";

describe(parseTileId, () => {
  const gid = 1;

  test("strips flipped flags", () => {
    expect.hasAssertions();

    expect(parseTileId(gid)).toBe(gid);
    expect(parseTileId(Flipped.Horizontally | gid)).toBe(gid);
    expect(parseTileId(Flipped.Vertically | gid)).toBe(gid);
    expect(parseTileId(Flipped.Diagonally | gid)).toBe(gid);
    expect(parseTileId(Flipped.Horizontally | Flipped.Vertically | Flipped.Diagonally | gid)).toBe(gid);
  });
});
