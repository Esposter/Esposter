import { TEST_FILENAME } from "#server/services/genshin/constants.test";
import { SCENE_EXPORT_ASSETS_FOLDER } from "#server/services/genshin/sceneExport/constants";
import { serveGenshinSceneExport } from "#server/services/genshin/sceneExport/serveGenshinSceneExport";
import {
  AVATAR_BINARY_FILE_NAME,
  AVATAR_MANIFEST_FILE_NAME,
  SCENE_EXPORT_INDEX_PATH,
  WITNESS_LAYOUT_FILE_NAME,
} from "genshin-world/sceneExport";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// A component holding an avatar alone, with its manifest, its binary and a texture its manifest names
const AVATAR_COMPONENT = `${TEST_FILENAME}-avatar`;
const TEXTURE_PATH = `Texture2D/${TEST_FILENAME}.png`;

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
    const avatarFolder = join(directory, AVATAR_COMPONENT);
    await mkdir(join(avatarFolder, SCENE_EXPORT_ASSETS_FOLDER, "Texture2D"), { recursive: true });
    await writeFile(join(avatarFolder, AVATAR_MANIFEST_FILE_NAME), '{"bones":[]}');
    await writeFile(join(avatarFolder, AVATAR_BINARY_FILE_NAME), "bin");
    await writeFile(join(avatarFolder, SCENE_EXPORT_ASSETS_FOLDER, TEXTURE_PATH), "png");
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

    expect(texts).toStrictEqual([`["${TEST_FILENAME}","${AVATAR_COMPONENT}"]`, "{}", " "]);
  });

  test("serves an avatar's manifest, its binary and a texture beside its assets", async () => {
    expect.hasAssertions();

    const texts = await Promise.all(
      [AVATAR_MANIFEST_FILE_NAME, AVATAR_BINARY_FILE_NAME, TEXTURE_PATH].map(async (path) =>
        (await serveGenshinSceneExport(`${AVATAR_COMPONENT}/${path}`, directory)).text(),
      ),
    );

    expect(texts).toStrictEqual(['{"bones":[]}', "bin", "png"]);
  });

  // An avatar's root files are served by name alone, and a texture only inside its assets, so a path climbing out of
  // Either, or a root file taken as a folder, is refused
  test.each([
    `${AVATAR_COMPONENT}/${AVATAR_MANIFEST_FILE_NAME}/${TEST_FILENAME}`,
    `${AVATAR_COMPONENT}/assets/../${AVATAR_MANIFEST_FILE_NAME}`,
    `${AVATAR_COMPONENT}/../${TEST_FILENAME}/${WITNESS_LAYOUT_FILE_NAME}/${AVATAR_BINARY_FILE_NAME}`,
    `${AVATAR_COMPONENT}/${SCENE_EXPORT_ASSETS_FOLDER}/${AVATAR_MANIFEST_FILE_NAME}`,
    `${TEST_FILENAME}/${AVATAR_MANIFEST_FILE_NAME}`,
  ])("finds nothing at an avatar's file outside its served paths: %s", async (path) => {
    expect.hasAssertions();
    expect((await serveGenshinSceneExport(path, directory)).status).toBe(404);
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
