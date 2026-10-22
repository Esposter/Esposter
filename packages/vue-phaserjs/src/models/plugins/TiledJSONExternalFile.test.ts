import { TiledJSONExternalFile } from "#src/models/plugins/TiledJSONExternalFile";
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
});
