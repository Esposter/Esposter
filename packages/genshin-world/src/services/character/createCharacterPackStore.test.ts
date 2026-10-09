import type { CharacterPackStorage } from "#src/models/character/CharacterPackStorage";

import { CHARACTER_PACK_INDEX_PATH } from "#src/services/character/constants";
import { createCharacterPackStore } from "#src/services/character/createCharacterPackStore";
import { createMemoryCharacterPackStorage } from "#src/services/character/createMemoryCharacterPackStorage";
import { noop } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(createCharacterPackStore, () => {
  const characterId = 1;
  const packHash = "0".repeat(64);
  const nextPackHash = "1".repeat(64);
  const path = "a/b";
  const fullPath = "c";
  const storageError = new DOMException("", "QuotaExceededError");
  const createCharacterPack = (hash: string) => ({
    characterId,
    files: new Map([[path, new Blob([hash])]]),
    modelName: "",
    packHash: hash,
    terms: "",
  });
  // A storage past its quota for the files the check picks, as a browser's is once its storage is full
  const createFullStorage = (
    storage: CharacterPackStorage,
    checkIsFull: (writtenPath: readonly string[]) => boolean,
  ): CharacterPackStorage => ({
    ...storage,
    write: (writtenPath, blob) =>
      checkIsFull(writtenPath) ? Promise.reject(storageError) : storage.write(writtenPath, blob),
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // A model names its textures with backslashes as often as slashes
  test("puts a pack and reads its files by the paths its model names them by", async () => {
    expect.hasAssertions();

    const store = createCharacterPackStore(createMemoryCharacterPackStorage());
    const index = await store.put(createCharacterPack(packHash));
    const blob = await store.readFile({ characterId, packHash }, String.raw`a\b`);

    expect(index).toStrictEqual([{ characterId, packHash }]);
    await expect(store.readIndex()).resolves.toStrictEqual(index);
    await expect(blob.text()).resolves.toBe(packHash);
  });

  test("puts a pack in place of its character's last one, whose files it removes", async () => {
    expect.hasAssertions();

    const store = createCharacterPackStore(createMemoryCharacterPackStorage());
    await store.put(createCharacterPack(packHash));
    const index = await store.put(createCharacterPack(nextPackHash));

    expect(index).toStrictEqual([{ characterId, packHash: nextPackHash }]);
    await expect(store.readFile({ characterId, packHash }, path)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/b, is no file of character 1's kept pack]`,
    );
  });

  test("removes the files of a pack it could not write whole, leaving the index, and says the storage is full", async () => {
    expect.hasAssertions();

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    const store = createCharacterPackStore(
      createFullStorage(createMemoryCharacterPackStorage(), (writtenPath) => writtenPath.at(-1) === fullPath),
    );
    const characterPack = createCharacterPack(packHash);

    await expect(
      store.put({ ...characterPack, files: new Map([...characterPack.files, [fullPath, new Blob()]]) }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: , was not kept, as the browser's storage is full]`,
    );
    await expect(store.readIndex()).resolves.toStrictEqual([]);
    await expect(store.readFile({ characterId, packHash }, path)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/b, is no file of character 1's kept pack]`,
    );
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(storageError);
  });

  // A failed write over the pack would otherwise remove the files the index names
  test("keeps a pack loaded again as it lies, writing nothing over it", async () => {
    expect.hasAssertions();

    const storage = createMemoryCharacterPackStorage();
    await createCharacterPackStore(storage).put(createCharacterPack(packHash));
    const store = createCharacterPackStore(createFullStorage(storage, () => true));
    const index = await store.put(createCharacterPack(packHash));
    const blob = await store.readFile({ characterId, packHash }, path);

    expect(index).toStrictEqual([{ characterId, packHash }]);
    await expect(blob.text()).resolves.toBe(packHash);
  });

  test.each<[string, (storage: CharacterPackStorage) => Promise<CharacterPackStorage>]>([
    [
      "no longer parses",
      async (storage) => {
        await storage.write([CHARACTER_PACK_INDEX_PATH], new Blob());
        return storage;
      },
    ],
    ["cannot be read", (storage) => Promise.resolve({ ...storage, read: () => Promise.reject(storageError) })],
  ])(
    "rebuilds an index that %s from the packs' folders, the first of a character's several",
    async (_title, breakIndex) => {
      expect.hasAssertions();

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
      const storage = createMemoryCharacterPackStorage();
      await createCharacterPackStore(storage).put(createCharacterPack(packHash));
      await storage.write([String(characterId), nextPackHash, path], new Blob());
      const store = createCharacterPackStore(await breakIndex(storage));

      await expect(store.readIndex()).resolves.toStrictEqual([{ characterId, packHash }]);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    },
  );

  test("removes a character's pack with its files", async () => {
    expect.hasAssertions();

    const store = createCharacterPackStore(createMemoryCharacterPackStorage());
    await store.put(createCharacterPack(packHash));
    const index = await store.remove(characterId);

    expect(index).toStrictEqual([]);
    await expect(store.readFile({ characterId, packHash }, path)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/b, is no file of character 1's kept pack]`,
    );
  });
});
