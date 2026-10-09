import { chooseCharacterPackReader } from "#src/services/character/chooseCharacterPackReader";
import { createCharacterPackStore } from "#src/services/character/createCharacterPackStore";
import { createMemoryCharacterPackStorage } from "#src/services/character/createMemoryCharacterPackStorage";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(chooseCharacterPackReader, () => {
  const characterId = 1;
  const characterPackBaseUrl = "a";
  const packHash = "0".repeat(64);
  const path = "b";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads the pack the browser keeps ahead of the host's, with no request", async () => {
    expect.hasAssertions();

    const fetch = vi.spyOn(globalThis, "fetch");
    const characterPackStore = createCharacterPackStore(createMemoryCharacterPackStorage());
    await characterPackStore.put({
      characterId,
      files: new Map([[path, new Blob([packHash])]]),
      modelName: "",
      packHash,
      terms: "",
    });
    const characterPackReader = chooseCharacterPackReader(characterId, {
      characterIdPackHashMap: new Map([[characterId, packHash]]),
      characterPackBaseUrl,
      characterPackStore,
      hostCharacterPackIds: new Set([characterId]),
    });
    const blob = await characterPackReader?.readFile(path);

    await expect(blob?.text()).resolves.toBe(packHash);
    expect(fetch).not.toHaveBeenCalled();
  });

  test("reads the host's pack where the browser keeps none", async () => {
    expect.hasAssertions();

    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response());
    const characterPackReader = chooseCharacterPackReader(characterId, {
      characterIdPackHashMap: new Map(),
      characterPackBaseUrl,
      characterPackStore: createCharacterPackStore(createMemoryCharacterPackStorage()),
      hostCharacterPackIds: new Set([characterId]),
    });
    await characterPackReader?.readFile(path);

    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual(["a/1/b"]);
  });

  test("reads no pack where neither the browser nor the host holds one, so the capsule is drawn", () => {
    expect.hasAssertions();
    expect(
      chooseCharacterPackReader(characterId, {
        characterIdPackHashMap: new Map(),
        characterPackBaseUrl,
        hostCharacterPackIds: new Set(),
      }),
    ).toBeUndefined();
  });
});
