import { KIT_MODULE_DIRECTORY } from "#scripts/kit/constants";
import { generateCharacterKitMap } from "#scripts/kit/generateCharacterKitMap";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(generateCharacterKitMap, () => {
  let packageDirectory: string;

  beforeEach(async () => {
    packageDirectory = await mkdtemp(join(tmpdir(), "character-kit-map-"));
  });

  afterEach(async () => {
    await rm(packageDirectory, { force: true, recursive: true });
  });

  test("leaves only the current map in its folder", async () => {
    expect.hasAssertions();

    const generatedDirectory = join(packageDirectory, "src", "generated", "characterKitMap");
    await mkdir(generatedDirectory, { recursive: true });
    await writeFile(join(generatedDirectory, "CharacterIdCreateKitMap.ts"), "");
    await mkdir(join(packageDirectory, "src", KIT_MODULE_DIRECTORY), { recursive: true });
    generateCharacterKitMap(packageDirectory);

    await expect(readdir(generatedDirectory)).resolves.toStrictEqual(["CharacterIdCreateKitBehaviourMap.ts"]);
  });
});
