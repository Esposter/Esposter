import type { ContainerClient } from "@azure/storage-blob";

import { DAY_MS } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { pruneGameData } from "#src/services/gameData/pruneGameData";
import { getCharacterPackBlobName } from "#src/services/genshinCharacters/getCharacterPackBlobName";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(pruneGameData, () => {
  const liveHash = "a".repeat(64);
  const oldHash = "b".repeat(64);
  const youngHash = "c".repeat(64);
  const containerClient = new MockContainerClient("", "dev") as unknown as ContainerClient;

  // Each blob is written at the instant the clock stands at, so the test moves the clock to age them
  const writeBlob = (blobName: string) => containerClient.getBlockBlobClient(blobName).upload(Buffer.from("{}"), 2);
  const writeObject = (hash: string) => writeBlob(getGameDataBlobName(hash));

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
  });

  test("deletes an object no live lock reaches and that is past retention, and keeps the rest", async () => {
    expect.hasAssertions();

    await writeObject(liveHash);
    await writeObject(oldHash);
    vi.setSystemTime(99 * DAY_MS);
    await writeObject(youngHash);
    vi.setSystemTime(100 * DAY_MS);
    const result = await pruneGameData({
      containerClient,
      isDryRun: false,
      liveHashes: new Set([liveHash]),
      now: 100 * DAY_MS,
    });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 1, keptCount: 0 });
    expect([...(MockContainerDatabase.get("dev")?.keys() ?? [])].toSorted()).toStrictEqual(
      [getGameDataBlobName(liveHash), getGameDataBlobName(youngHash)].toSorted(),
    );
  });

  // A pack's files are named by its path in the pack, under the hash of the record a lock names the pack by
  test("deletes a character pack's files no live lock names past retention, and keeps a live pack's", async () => {
    expect.hasAssertions();

    await writeBlob(getCharacterPackBlobName(0, liveHash, "a"));
    await writeBlob(getCharacterPackBlobName(0, oldHash, "a"));
    vi.setSystemTime(100 * DAY_MS);
    const result = await pruneGameData({
      containerClient,
      isDryRun: false,
      liveHashes: new Set([liveHash]),
      now: 100 * DAY_MS,
    });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 1, keptCount: 0 });
    expect([...(MockContainerDatabase.get("dev")?.keys() ?? [])]).toStrictEqual([
      getCharacterPackBlobName(0, liveHash, "a"),
    ]);
  });

  test("lists what it would delete without deleting it", async () => {
    expect.hasAssertions();

    await writeObject(oldHash);
    const result = await pruneGameData({ containerClient, isDryRun: true, liveHashes: new Set(), now: 100 * DAY_MS });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 0, keptCount: 0 });
    expect(MockContainerDatabase.get("dev")?.size).toBe(1);
  });
});
