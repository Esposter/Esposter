import type { ContainerClient } from "@azure/storage-blob";

import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { pruneGameData } from "#src/services/gameData/pruneGameData";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(pruneGameData, () => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const liveHash = "a".repeat(64);
  const oldHash = "b".repeat(64);
  const youngHash = "c".repeat(64);
  const containerClient = new MockContainerClient("", "dev") as unknown as ContainerClient;

  // Each object is written at the instant the clock stands at, so the test moves the clock to age them
  const writeObject = (hash: string) =>
    containerClient.getBlockBlobClient(getGameDataBlobName(hash)).upload(Buffer.from("{}"), 2);

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

  test("lists what it would delete without deleting it", async () => {
    expect.hasAssertions();

    await writeObject(oldHash);
    const result = await pruneGameData({ containerClient, isDryRun: true, liveHashes: new Set(), now: 100 * DAY_MS });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 0, keptCount: 0 });
    expect(MockContainerDatabase.get("dev")?.size).toBe(1);
  });
});
