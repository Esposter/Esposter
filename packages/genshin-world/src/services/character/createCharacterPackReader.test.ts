import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";

import { CHARACTER_MODEL_PATH, CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { createCharacterPackCacheStub } from "#src/services/character/createCharacterPackCacheStub.test";
import { createCharacterPackReader } from "#src/services/character/createCharacterPackReader";
import { describe, expect, test } from "vitest";

describe(createCharacterPackReader, () => {
  const gameDataBaseUrl = "http://a.test";
  const modelUrl = "http://a.test/characterPacks/1/model.pmx?v=0000000000000000";
  const termsUrl = "http://a.test/characterPacks/1/terms.txt?v=0000000000000000";
  const modelText = "model";
  const termsText = "terms";
  const avatar: CharacterPackIndex["avatars"][number] = {
    avatarId: 1,
    files: [
      { bytes: 5, path: CHARACTER_MODEL_PATH, sha256: "0".repeat(64) },
      { bytes: 5, path: CHARACTER_TERMS_PATH, sha256: "0".repeat(64) },
    ],
    name: "a",
  };

  test("reads a model file and a terms file through the reader from a stubbed cache", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(modelUrl, new Response(modelText));
    await cache.put(termsUrl, new Response(termsText));
    const characterPackReader = createCharacterPackReader(cache, gameDataBaseUrl, avatar);

    const modelBlob = await characterPackReader.readFile(CHARACTER_MODEL_PATH);
    const termsBlob = await characterPackReader.readFile(CHARACTER_TERMS_PATH);

    expect(await modelBlob?.text()).toBe(modelText);
    expect(await termsBlob?.text()).toBe(termsText);
  });
});
