import { parseTileset } from "#src/services/parseTileset";
import { noop } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const throwError = (error: Error): never => {
  throw error;
};

describe(parseTileset, () => {
  test("parses a tileset file as an embedded tileset with its image and tiles", () => {
    expect.hasAssertions();

    const tileset = parseTileset(
      `<?xml version="1.0"?><tileset name="tiles" tilewidth="16" tileheight="16" tilecount="4" columns="2"><image source="tiles.png" width="32" height="32"/><tile id="0" type="ground"/></tileset>`,
    );

    expect(tileset.match((parsedTileset) => parsedTileset, throwError)).toStrictEqual({
      columns: 2,
      firstgid: 0,
      image: { height: 32, source: "tiles.png", width: 32 },
      name: "tiles",
      tilecount: 4,
      tileheight: 16,
      tiles: [{ id: 0, type: "ground" }],
      tilewidth: 16,
    });
  });

  test("refuses a document whose root is not a tileset", () => {
    expect.hasAssertions();

    parseTileset("<map/>").match(noop, (error) => {
      expect(() => {
        throw error;
      }).toThrowErrorMatchingInlineSnapshot(
        `[InvalidOperationError: Invalid operation: Read, name: parseTileset, has no embedded tileset root element]`,
      );
    });
  });
});
