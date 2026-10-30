import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";

import { CHARACTER_MODEL_PATH } from "#src/services/character/constants";
import { createCharacterPackCacheStub } from "#src/services/character/createCharacterPackCacheStub.test";
import { readCharacterPackIndex } from "#src/services/character/readCharacterPackIndex";
import { readCharacterPackReaders } from "#src/services/character/readCharacterPackReaders";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readCharacterPackReaders, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // The preload reads the index as the opening mounts and the world's gate reads it again when the world opens,
  // Yet the second read is the first one's object, so the index is fetched once for both readers
  test("fetches the index once for the preload and the world gate", async () => {
    expect.hasAssertions();

    const gameDataBaseUrl = "http://pack-readers.test";
    const index: CharacterPackIndex = {
      avatars: [{ avatarId: 1, files: [{ bytes: 5, path: CHARACTER_MODEL_PATH, sha256: "0".repeat(64) }], name: "a" }],
    };
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(Response.json(index)));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("caches", { open: () => Promise.resolve(createCharacterPackCacheStub()) });

    await readCharacterPackIndex(gameDataBaseUrl);
    const characterPackReaders = await readCharacterPackReaders(gameDataBaseUrl);

    expect([...characterPackReaders.keys()]).toStrictEqual([1]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
