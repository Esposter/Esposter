import { TEST_FILENAME } from "#server/services/genshin/constants.test";
import { SCENE_EXPORT_ASSETS_FOLDER } from "#server/services/genshin/sceneExport/constants";
import { serveGenshinSceneExport } from "#server/services/genshin/sceneExport/serveGenshinSceneExport";
import { SCENE_EXPORT_INDEX_PATH, WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(serveGenshinSceneExport, () => {
  let directory = "";

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), TEST_FILENAME));
    const meshFolder = join(directory, TEST_FILENAME, SCENE_EXPORT_ASSETS_FOLDER, TEST_FILENAME);
    await mkdir(meshFolder, { recursive: true });
    await writeFile(join(directory, TEST_FILENAME, WITNESS_LAYOUT_FILE_NAME), "{}");
    await writeFile(join(meshFolder, `${TEST_FILENAME}.obj`), " ");
    // A folder holding no layout is no component's, as the extraction's other folders hold none
    await mkdir(join(directory, `${TEST_FILENAME}${TEST_FILENAME}`));
    await writeFile(join(directory, TEST_FILENAME, TEST_FILENAME), "  ");
  });

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("serves the index of the components with a layout, a component's layout and a file of its assets", async () => {
    expect.hasAssertions();

    const texts = await Promise.all(
      [
        SCENE_EXPORT_INDEX_PATH,
        `${TEST_FILENAME}/${WITNESS_LAYOUT_FILE_NAME}`,
        `${TEST_FILENAME}/${TEST_FILENAME}/${TEST_FILENAME}.obj`,
      ].map(async (path) => (await serveGenshinSceneExport(path, directory)).text()),
    );

    expect(texts).toStrictEqual([`["${TEST_FILENAME}"]`, "{}", " "]);
  });

  // Only a listed component's layout or a file inside its assets is served, so a path climbing out of them, encoded or
  // Not, and a folder holding no layout are refused
  test.each([
    "..",
    `${TEST_FILENAME}${TEST_FILENAME}/${WITNESS_LAYOUT_FILE_NAME}`,
    `${TEST_FILENAME}/..%2F${TEST_FILENAME}`,
    `${TEST_FILENAME}/../../${TEST_FILENAME}/${TEST_FILENAME}`,
  ])("finds nothing at %s", async (path) => {
    expect.hasAssertions();
    expect((await serveGenshinSceneExport(path, directory)).status).toBe(404);
  });

  test("finds nothing at an absolute path, even one of a file beside the assets", async () => {
    expect.hasAssertions();
    expect(
      (
        await serveGenshinSceneExport(
          `${TEST_FILENAME}/${encodeURIComponent(join(directory, TEST_FILENAME, TEST_FILENAME))}`,
          directory,
        )
      ).status,
    ).toBe(404);
  });
});
