import { createCharacterPackStore } from "#src/services/character/createCharacterPackStore";
import { createMemoryCharacterPackStorage } from "#src/services/character/createMemoryCharacterPackStorage";
import { describe, expect, test } from "vitest";

describe(createCharacterPackStore, () => {
  const characterId = 1;
  const packHash = "0".repeat(64);
  const nextPackHash = "1".repeat(64);
  const path = "a/b";
  const createCharacterPack = (hash: string) => ({
    characterId,
    files: new Map([[path, new Blob([hash])]]),
    modelName: "",
    packHash: hash,
    terms: "",
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
