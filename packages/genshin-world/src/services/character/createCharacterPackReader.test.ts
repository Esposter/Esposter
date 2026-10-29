import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";

import { CHARACTER_MODEL_PATH, CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { createCharacterPackCacheStub } from "#src/services/character/createCharacterPackCacheStub.test";
import { createCharacterPackReader } from "#src/services/character/createCharacterPackReader";
import { describe, expect, test } from "vitest";

describe(createCharacterPackReader, () => {
  const gameDataBaseUrl = "http://a.test";
  const sha256 = "0".repeat(64);
  const modelUrl = "http://a.test/characterPacks/1/folder/model.pmx?v=0000000000000000";
  const textureUrl = "http://a.test/characterPacks/1/folder/tex.png?v=0000000000000000";
  const termsUrl = "http://a.test/characterPacks/1/terms.txt?v=0000000000000000";
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

  test("Held pack draws the character's model", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(modelUrl, new Response(modelText));
    const characterPackReader = await createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    const modelBlob = await characterPackReader.readFile(CHARACTER_MODEL_PATH);

    expect(await modelBlob?.text()).toBe(modelText);
  });

  test("A texture the model names is read beside the model's folder", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(textureUrl, new Response(textureText));
    const characterPackReader = await createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    const textureBlob = await characterPackReader.readFile("tex.png");

    expect(await textureBlob?.text()).toBe(textureText);
  });

  test("Terms are read from the pack's terms file", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(termsUrl, new Response(termsText));
    const characterPackReader = await createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    const termsBlob = await characterPackReader.readFile(CHARACTER_TERMS_PATH);

    expect(await termsBlob?.text()).toBe(termsText);
  });

  test("A file the pack does not list is none", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    const characterPackReader = await createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    expect(await characterPackReader.readFile("missing.png")).toBeUndefined();
  });
});
