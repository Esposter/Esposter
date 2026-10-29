import type { ContainerClient } from "@azure/storage-blob";

import { DAY_MS } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { pruneGameData } from "#src/services/gameData/pruneGameData";
import { CHARACTER_PACKS_BLOB_PREFIX } from "#src/services/genshinAssets/characterPacks/constants";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(pruneGameData, () => {
  const dataset = "stats/weapons";
  const liveHash = "a".repeat(64);
  const oldHash = "b".repeat(64);
  const youngHash = "c".repeat(64);
  const containerClient = new MockContainerClient("", "dev") as unknown as ContainerClient;

  // Each object is written at the instant the clock stands at, so the test moves the clock to age them
  const writeObject = (hash: string) =>
    containerClient.getBlockBlobClient(getGameDataBlobName(dataset, hash)).upload(Buffer.from("{}"), 2);

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
      liveObjects: [{ dataset, hash: liveHash }],
      now: 100 * DAY_MS,
    });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 1, keptCount: 0 });
    expect([...(MockContainerDatabase.get("dev")?.keys() ?? [])].toSorted()).toStrictEqual(
      [getGameDataBlobName(dataset, liveHash), getGameDataBlobName(dataset, youngHash)].toSorted(),
    );
  });

  test("keeps an old blob outside the game data datasets", async () => {
    expect.hasAssertions();

    const packBlobName = `${CHARACTER_PACKS_BLOB_PREFIX}/10000006/model.pmx`;
    await containerClient.getBlockBlobClient(packBlobName).upload(Buffer.from("{}"), 2);
    vi.setSystemTime(100 * DAY_MS);
    const result = await pruneGameData({ containerClient, isDryRun: false, liveObjects: [], now: 100 * DAY_MS });

    expect(result).toStrictEqual({ candidateCount: 0, deletedCount: 0, keptCount: 0 });
    expect([...(MockContainerDatabase.get("dev")?.keys() ?? [])]).toStrictEqual([packBlobName]);
  });

  test("lists what it would delete without deleting it", async () => {
    expect.hasAssertions();

    await writeObject(oldHash);
    const result = await pruneGameData({ containerClient, isDryRun: true, liveObjects: [], now: 100 * DAY_MS });

    expect(result).toStrictEqual({ candidateCount: 1, deletedCount: 0, keptCount: 0 });
    expect(MockContainerDatabase.get("dev")?.size).toBe(1);
  });
});
