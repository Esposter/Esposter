import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { ContainerClient } from "@azure/storage-blob";
import type { GameDataLock } from "genshin-world";

import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { formatGameDataLock } from "#src/services/gameData/formatGameDataLock";
import { publishGameData } from "#src/services/gameData/publishGameData";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { GameDataset } from "genshin-world";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The mock keeps one store per container name, so each account's mock is named for its account
const createContainerClientMap = () => ({
  [GameDataTarget.Dev]: new MockContainerClient("", GameDataTarget.Dev) as unknown as ContainerClient,
  [GameDataTarget.Prod]: new MockContainerClient("", GameDataTarget.Prod) as unknown as ContainerClient,
});

describe(publishGameData, () => {
  const emptyLock: GameDataLock = { indexes: {}, objects: {} };
  // One object, and an index of two entries: four stored objects in all
  const publication: GameDataPublication = {
    indexes: { "profile/English": { "10000002": { name: "a" }, "10000003": { name: "b" } } },
    objects: { "stats/weapons": [1, 2] },
  };
  const scopes = [GameDataset.Profile, GameDataset.Stats];

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
  });

  test("stores each object once per account and names it in the lock it returns", async () => {
    expect.hasAssertions();

    const result = await publishGameData({
      containerClientMap: createContainerClientMap(),
      currentLock: emptyLock,
      publication,
      scopes,
    });

    expect(result.isUnchanged).toBe(false);
    expect(Object.keys(result.nextLock.objects)).toStrictEqual(["stats/weapons"]);
    expect(Object.keys(result.nextLock.indexes)).toStrictEqual(["profile/English"]);
    expect(result.uploadedCountMap).toStrictEqual({ [GameDataTarget.Dev]: 4, [GameDataTarget.Prod]: 4 });
    expect(MockContainerDatabase.get(GameDataTarget.Prod)?.size).toBe(4);
  });

  test("stores nothing when the lock already names the publication", async () => {
    expect.hasAssertions();

    const containerClientMap = createContainerClientMap();
    const { nextLock } = await publishGameData({ containerClientMap, currentLock: emptyLock, publication, scopes });
    const rerun = await publishGameData({ containerClientMap, currentLock: nextLock, publication, scopes });

    expect(rerun).toStrictEqual({ isUnchanged: true, nextLock, storedObjectCount: 0 });
    expect(MockContainerDatabase.get(GameDataTarget.Dev)?.size).toBe(4);
  });

  // A record that changes is one new object, and its index is the only other object a lock change needs
  test("stores a changed record and its index only", async () => {
    expect.hasAssertions();

    const containerClientMap = createContainerClientMap();
    const { nextLock } = await publishGameData({ containerClientMap, currentLock: emptyLock, publication, scopes });
    const changedPublication: GameDataPublication = {
      ...publication,
      indexes: { "profile/English": { ...publication.indexes["profile/English"], "10000003": { name: "c" } } },
    };
    const result = await publishGameData({
      containerClientMap,
      currentLock: nextLock,
      publication: changedPublication,
      scopes,
    });

    expect(result.uploadedCountMap).toStrictEqual({ [GameDataTarget.Dev]: 2, [GameDataTarget.Prod]: 2 });
  });

  // An object stored long ago and named by no lock is rewritten with its bytes, which restarts its age past any prune
  test("rewrites a stored object that is past the reuse window and that no lock names", async () => {
    expect.hasAssertions();

    await publishGameData({
      containerClientMap: createContainerClientMap(),
      currentLock: emptyLock,
      publication,
      scopes,
    });
    vi.setSystemTime(100 * 24 * 60 * 60 * 1000);
    const result = await publishGameData({
      containerClientMap: createContainerClientMap(),
      currentLock: emptyLock,
      publication,
      scopes,
    });

    expect(result.uploadedCountMap).toStrictEqual({ [GameDataTarget.Dev]: 4, [GameDataTarget.Prod]: 4 });
  });

  test("names the same lock whatever order the records were produced in", async () => {
    expect.hasAssertions();

    const reordered: GameDataPublication = {
      ...publication,
      indexes: { "profile/English": { "10000002": { name: "a" }, "10000003": { name: "b" } } },
    };
    const first = await publishGameData({ currentLock: emptyLock, publication, scopes });
    const second = await publishGameData({ currentLock: emptyLock, publication: reordered, scopes });

    expect(formatGameDataLock(second.nextLock)).toBe(formatGameDataLock(first.nextLock));
  });

  // A dry run is the build alone: it names what it would publish and reads and writes no account
  test("names what it would publish without touching an account", async () => {
    expect.hasAssertions();

    const result = await publishGameData({ currentLock: emptyLock, publication, scopes });

    expect(result).toStrictEqual({ isUnchanged: false, nextLock: result.nextLock, storedObjectCount: 4 });
    expect(MockContainerDatabase.size).toBe(0);
  });

  // An account that refuses a write must leave the lock where it was, which the caller only moves once this resolves
  test("rejects when an account refuses a write", async () => {
    expect.hasAssertions();

    const containerClientMap = createContainerClientMap();
    vi.spyOn(containerClientMap[GameDataTarget.Prod], "getBlockBlobClient").mockImplementation(() => {
      throw new Error("offline");
    });

    await expect(
      publishGameData({ containerClientMap, currentLock: emptyLock, publication, scopes }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[AggregateError: offline]`);
  });

  test("rejects a record published outside the scopes it names", async () => {
    expect.hasAssertions();

    await expect(
      publishGameData({ currentLock: emptyLock, publication, scopes: [GameDataset.Profile] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: stats/weapons, is published outside the scopes it names]`,
    );
  });
});
