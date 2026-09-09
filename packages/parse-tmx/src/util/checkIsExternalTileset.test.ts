import { createEmbeddedTilesetShared } from "#src/test/createEmbeddedTilesetShared.test";
import { createExternalTilesetShared } from "#src/test/createExternalTilesetShared.test";
import { checkIsExternalTileset } from "#src/util/checkIsExternalTileset";
import { describe, expect, test } from "vitest";

describe(checkIsExternalTileset, () => {
  test("external tileset", () => {
    expect.hasAssertions();

    expect(checkIsExternalTileset(createExternalTilesetShared())).toBe(true);
  });

  test("embedded tileset", () => {
    expect.hasAssertions();

    expect(checkIsExternalTileset(createEmbeddedTilesetShared())).toBe(false);
  });
});
