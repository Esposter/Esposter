import { KIT_MODULE_DIRECTORY } from "#scripts/kit/constants";
import { generateCharacterKitMap } from "#scripts/kit/generateCharacterKitMap";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { format } from "oxfmt";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// oxlint-disable-next-line no-restricted-imports -- the repo-root formatter config, which no `#` map can reach
import formatterConfiguration from "../../../../oxfmt.config.ts";

describe(generateCharacterKitMap, () => {
  const MAP_FILE_NAME = "CharacterIdCreateKitBehaviourMap.ts";
  let packageDirectory: string;

  const createMap = async (): Promise<string> => {
    const kitDirectory = join(packageDirectory, "src", KIT_MODULE_DIRECTORY);
    await mkdir(kitDirectory, { recursive: true });
    await writeFile(
      join(kitDirectory, "ayakaKit.ts"),
      "export const AYAKA_CHARACTER_ID = 10_000_002;\nexport const createAyakaKitBehaviour = () => {};\n",
    );
    await generateCharacterKitMap(packageDirectory);
    return readFile(join(packageDirectory, "src", "generated", "characterKitMap", MAP_FILE_NAME), "utf8");
  };

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
    await generateCharacterKitMap(packageDirectory);

    await expect(readdir(generatedDirectory)).resolves.toStrictEqual([MAP_FILE_NAME]);
  });

  test("opens with a file-level eslint directive, its reason beside it", async () => {
    expect.hasAssertions();

    const text = await createMap();

    expect(text.split("\n", 1)[0]).toMatch(/^\/\* eslint-disable no-restricted-syntax -- .+ \*\/$/u);
  });

  test("writes a map the formatter leaves unchanged", async () => {
    expect.hasAssertions();

    const text = await createMap();
    const { code, errors } = await format(MAP_FILE_NAME, text, formatterConfiguration);

    expect(errors).toStrictEqual([]);
    expect(code).toBe(text);
  });
});
