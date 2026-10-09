import { TEST_FILENAME } from "#server/services/genshin/characterPack/constants.test";
import { serveGenshinCharacterPack } from "#server/services/genshin/characterPack/serveGenshinCharacterPack";
import { CHARACTER_MODEL_PATH, CHARACTER_PACK_INDEX_PATH, CHARACTER_TERMS_PATH } from "genshin-world/characterPack";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(serveGenshinCharacterPack, () => {
  let directory = "";

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), TEST_FILENAME));
  });

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  // A model's textures sit beside it, wherever its folder nests it, and are matched as MMD matches a path
  test("serves the index, a character's one model, its terms and a texture beside the model", async () => {
    expect.hasAssertions();

    const modelFolder = join(directory, "1", TEST_FILENAME);
    await mkdir(modelFolder, { recursive: true });
    await writeFile(join(modelFolder, `${TEST_FILENAME}.pmx`), "");
    await writeFile(join(modelFolder, `${TEST_FILENAME}.png`), " ");
    await writeFile(join(directory, "1", "readme.txt"), "  ");
    const texts = await Promise.all(
      [
        CHARACTER_PACK_INDEX_PATH,
        `1/${CHARACTER_MODEL_PATH}`,
        `1/${CHARACTER_TERMS_PATH}`,
        `1/${TEST_FILENAME.toUpperCase()}.PNG`,
      ].map(async (path) => (await serveGenshinCharacterPack(path, directory, "")).text()),
    );

    expect(texts).toStrictEqual(["[1]", "", "  ", " "]);
  });

  // A folder is read only when its name is a character's id, so a path climbing out of the packs' directory is refused
  test.each(["..", `1/${CHARACTER_MODEL_PATH}`])("finds nothing at %s", async (path) => {
    expect.hasAssertions();
    expect((await serveGenshinCharacterPack(path, directory, "")).status).toBe(404);
  });
});
