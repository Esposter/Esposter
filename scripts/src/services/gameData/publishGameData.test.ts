import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { GameDataPublishResult } from "#src/models/gameData/GameDataPublishResult";
import type { ContainerClient } from "@azure/storage-blob";
import type { GameDataLock } from "genshin-world";

import { GameDataPublishOutcome } from "#src/models/gameData/GameDataPublishOutcome";
import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { DAY_MS } from "#src/services/gameData/constants";
import { formatGameDataLock } from "#src/services/gameData/formatGameDataLock";
import { publishGameData } from "#src/services/gameData/publishGameData";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { GameDataset } from "genshin-world";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The mock keeps one store per container name, so each account's mock is named for its account
const createContainerClientMap = () => ({
  [GameDataTarget.Dev]: new MockContainerClient("", GameDataTarget.Dev) as unknown as ContainerClient,
  [GameDataTarget.Prod]: new MockContainerClient("", GameDataTarget.Prod) as unknown as ContainerClient,
});

// The lock a published result plans, which a caller commits and a test carries into its next publish
const getPlannedLock = (result: GameDataPublishResult): GameDataLock => {
  if (result.outcome !== GameDataPublishOutcome.Published)
    throw new InvalidOperationError(Operation.Read, result.outcome, "is not a published publication");
  return result.plannedLock;
};

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

  test("stores each object once per account and plans the lock it names", async () => {
    expect.hasAssertions();

    const result = await publishGameData({
      containerClientMap: createContainerClientMap(),
      currentLock: emptyLock,
      publication,
      scopes,
    });

    const plannedLock = getPlannedLock(result);
    expect(Object.keys(plannedLock.objects)).toStrictEqual(["stats/weapons"]);
    expect(Object.keys(plannedLock.indexes)).toStrictEqual(["profile/English"]);
    expect(result).toStrictEqual({
      outcome: GameDataPublishOutcome.Published,
      plannedLock,
      storedObjectCount: 4,
      uploadedCountMap: { [GameDataTarget.Dev]: 4, [GameDataTarget.Prod]: 4 },
    });
    expect(MockContainerDatabase.get(GameDataTarget.Prod)?.size).toBe(4);
  });

  test("stores nothing when the lock already names the publication", async () => {
    expect.hasAssertions();

    const containerClientMap = createContainerClientMap();
    const currentLock = getPlannedLock(
      await publishGameData({ containerClientMap, currentLock: emptyLock, publication, scopes }),
    );
    const rerun = await publishGameData({ containerClientMap, currentLock, publication, scopes });

    expect(rerun).toStrictEqual({ outcome: GameDataPublishOutcome.Unchanged });
    expect(MockContainerDatabase.get(GameDataTarget.Dev)?.size).toBe(4);
  });

  // A record that changes is one new object, and its index is the only other object a lock change needs
  test("stores a changed record and its index only", async () => {
    expect.hasAssertions();

    const containerClientMap = createContainerClientMap();
    const currentLock = getPlannedLock(
      await publishGameData({ containerClientMap, currentLock: emptyLock, publication, scopes }),
    );
    const changedPublication: GameDataPublication = {
      ...publication,
      indexes: { "profile/English": { ...publication.indexes["profile/English"], "10000003": { name: "c" } } },
    };
    const result = await publishGameData({ containerClientMap, currentLock, publication: changedPublication, scopes });

    expect(result).toStrictEqual({
      outcome: GameDataPublishOutcome.Published,
      plannedLock: getPlannedLock(result),
      storedObjectCount: 4,
      uploadedCountMap: { [GameDataTarget.Dev]: 2, [GameDataTarget.Prod]: 2 },
    });
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
    vi.setSystemTime(100 * DAY_MS);
    const result = await publishGameData({
      containerClientMap: createContainerClientMap(),
      currentLock: emptyLock,
      publication,
      scopes,
    });

    expect(result).toStrictEqual({
      outcome: GameDataPublishOutcome.Published,
      plannedLock: getPlannedLock(result),
      storedObjectCount: 4,
      uploadedCountMap: { [GameDataTarget.Dev]: 4, [GameDataTarget.Prod]: 4 },
    });
  });

  // An index is hashed from its entries in id order, so the lock names the same index whatever order its records were
  // Built in. The ids here are not integers, which an object would otherwise keep in insertion order on its own
  test("names the same lock whatever order an index's entries were produced in", async () => {
    expect.hasAssertions();

    const ascending: GameDataPublication = {
      indexes: { "profile/English": { alpha: { name: "a" }, beta: { name: "b" } } },
      objects: {},
    };
    // Inserted beta first, which an object literal would not keep in its written order
    const descending: GameDataPublication = {
      indexes: {
        "profile/English": Object.fromEntries([
          ["beta", { name: "b" }],
          ["alpha", { name: "a" }],
        ]),
      },
      objects: {},
    };
    const first = getPlannedLock(
      await publishGameData({
        containerClientMap: createContainerClientMap(),
        currentLock: emptyLock,
        publication: ascending,
        scopes,
      }),
    );
    const second = getPlannedLock(
      await publishGameData({
        containerClientMap: createContainerClientMap(),
        currentLock: emptyLock,
        publication: descending,
        scopes,
      }),
    );

    expect(formatGameDataLock(second)).toBe(formatGameDataLock(first));
  });

  // A dry run is the build alone: it names what it would publish and reads and writes no account
  test("names what it would publish without touching an account", async () => {
    expect.hasAssertions();

    const result = await publishGameData({ currentLock: emptyLock, publication, scopes });

    expect(result).toStrictEqual({ outcome: GameDataPublishOutcome.DryRun, storedObjectCount: 4 });
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
