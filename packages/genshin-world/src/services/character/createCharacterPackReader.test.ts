import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";

import { chooseCharacterPackModel } from "#src/services/character/chooseCharacterPackModel";
import { CHARACTER_MODEL_PATH, CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { createCharacterPackCacheStub } from "#src/services/character/createCharacterPackCacheStub.test";
import { createCharacterPackReader } from "#src/services/character/createCharacterPackReader";
import { describe, expect, test, vi } from "vitest";

// The real chooser, recorded, so a test sees when the model is chosen
vi.mock(import("#src/services/character/chooseCharacterPackModel"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    chooseCharacterPackModel: vi.fn<typeof original.chooseCharacterPackModel>(original.chooseCharacterPackModel),
  };
});

describe(createCharacterPackReader, () => {
  const gameDataBaseUrl = "http://a.test";
  const sha256 = "0".repeat(64);
  const modelUrl = `http://a.test/characterPacks/1/folder/model.pmx?sha256=${sha256}`;
  const textureUrl = `http://a.test/characterPacks/1/folder/tex.png?sha256=${sha256}`;
  const termsUrl = `http://a.test/characterPacks/1/terms.txt?sha256=${sha256}`;
  const modelText = "model";
  const textureText = "texture";
  const termsText = "terms";
  const avatar: CharacterPackIndex["avatars"][number] = {
    avatarId: 1,
    files: [
      { bytes: 5, path: "folder/model.pmx", sha256 },
      { bytes: 7, path: "folder/tex.png", sha256 },
      { bytes: 5, path: "terms.txt", sha256 },
    ],
    name: "a",
  };

  test("the model is chosen by the first read, not when the reader is made", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(modelUrl, new Response(modelText));
    const characterPackReader = createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    expect(chooseCharacterPackModel).not.toHaveBeenCalled();

    const modelBlob = await characterPackReader.readFile(CHARACTER_MODEL_PATH);

    expect(chooseCharacterPackModel).toHaveBeenCalledTimes(1);
    await expect(modelBlob?.text()).resolves.toBe(modelText);
  });

  test("held pack draws the character's model", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(modelUrl, new Response(modelText));
    const characterPackReader = createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    const modelBlob = await characterPackReader.readFile(CHARACTER_MODEL_PATH);

    await expect(modelBlob?.text()).resolves.toBe(modelText);
  });

  test("a texture the model names is read beside the model's folder", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(textureUrl, new Response(textureText));
    const characterPackReader = createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    const textureBlob = await characterPackReader.readFile("tex.png");

    await expect(textureBlob?.text()).resolves.toBe(textureText);
  });

  test("terms are read from the pack's terms file", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(termsUrl, new Response(termsText));
    const characterPackReader = createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    const termsBlob = await characterPackReader.readFile(CHARACTER_TERMS_PATH);

    await expect(termsBlob?.text()).resolves.toBe(termsText);
  });

  test("a file the pack does not list is none", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    const characterPackReader = createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    await expect(characterPackReader.readFile("missing.png")).resolves.toBeUndefined();
  });
});
