import { getTilesetDefinitionFields } from "#src/services/shared/getTilesetDefinitionFields";
import { describe, expect, test } from "vitest";

describe(getTilesetDefinitionFields, () => {
  // A definition without a firstgid once blanked the map's, which left Phaser mapping no tile ids for the tileset
  test("keeps the map's firstgid and returns only the fields the definition sets", () => {
    expect.hasAssertions();

    expect(
      getTilesetDefinitionFields({
        columns: 2,
        firstgid: undefined,
        margin: undefined,
        name: "Bushes",
        tilecount: 4,
        tileheight: 64,
        tilewidth: 64,
      }),
    ).toStrictEqual({ columns: 2, name: "Bushes", tilecount: 4, tileheight: 64, tilewidth: 64 });
  });
});
