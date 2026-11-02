import { TiledJSONExternalFile } from "#src/models/plugins/TiledJSONExternalFile";
import { TilesetFile } from "#src/models/plugins/TilesetFile";
import { removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { afterEach, describe, expect, test } from "vitest";

describe(TiledJSONExternalFile, () => {
  const sceneKey = "sceneKey";

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test("throws for a tileset with no url and leaves the loader's base url as it was", () => {
    expect.hasAssertions();

    const { load } = startTestScene(sceneKey);
    load.setBaseURL("original/");
    const file = new TiledJSONExternalFile(load, { baseURL: "", key: sceneKey, tilesetURLs: {}, url: "" });
    const [tilemapFile] = file.files;
    tilemapFile.type = "json";
    tilemapFile.data = { tilesets: [{ firstgid: 1, source: "Missing.tsx" }] };

    expect(() => {
      file.onFileComplete(tilemapFile);
    }).toThrowErrorMatchingInlineSnapshot(`[NotFoundError: onFileComplete is not found for id: Missing.tsx]`);
    expect(load.baseURL).toBe("original/");
  });

  test("caches a copy of the tilemap, so the object it was given keeps each tileset's source for the next load", () => {
    expect.hasAssertions();

    const { load } = startTestScene(sceneKey);
    const tilemap = { tilesets: [{ firstgid: 1, source: "Test.tsx" }] };
    const file = new TiledJSONExternalFile(load, { baseURL: "", key: sceneKey, tilesetURLs: {}, url: tilemap });
    const tilesetFile = new TilesetFile(0, load, `${sceneKey}Tileset`, "Test.tsx");
    Object.defineProperty(tilesetFile, "xhrLoader", {
      value: {
        responseText: `<tileset name="Test" tilewidth="16" tileheight="16" tilecount="1" columns="1"><image source="Test.png" width="16" height="16"/></tileset>`,
      },
    });
    file.files.push(tilesetFile);
    file.pending = 0;
    file.addToCache();

    expect(tilemap.tilesets).toStrictEqual([{ firstgid: 1, source: "Test.tsx" }]);
    expect(load.cacheManager.tilemap.get(sceneKey).data.tilesets[0].source).toBeUndefined();
  });
});
