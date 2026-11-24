import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { commitHostedAssetLock } from "#src/services/hostedAssets/commitHostedAssetLock";
import { createHostedAssetLockObject } from "#src/services/hostedAssets/createHostedAssetLockObject.test";
import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { writeHostedAssetLock } from "#src/services/hostedAssets/writeHostedAssetLock";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { StorageBucket } from "@esposter/db-schema";
import { GameDataset } from "genshin-world/definitions";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const createHash = (character: string) => character.repeat(64);

describe(commitHostedAssetLock, () => {
  const BOOK_BODY_ENGLISH_KEY = "bookBody/English";
  const PROFILE_ENGLISH_KEY = "profile/English";
  const STATS_WEAPONS_KEY = "stats/weapons";

  let lockPath: string;
  let product: HostedAssetProduct;

  beforeEach(async () => {
    lockPath = join(await mkdtemp(join(tmpdir(), "game-data-lock-")), "gameDataLock.json");
    product = {
      bucket: StorageBucket.PublicHostedAssets,
      lockPath,
      lockRepositoryPath: TEST_FILENAME,
      name: TEST_FILENAME,
      scopes: [GameDataset.BookBody, GameDataset.Login, GameDataset.Profile, GameDataset.Stats],
      source: { kind: "records" },
    };
  });

  afterEach(async () => {
    await rm(dirname(lockPath), { force: true, recursive: true });
  });

  // Another publication committed its scope while this one was uploading, and this commit must keep those entries
  test("keeps the entries another publication committed while this one was uploading", async () => {
    expect.hasAssertions();

    await writeHostedAssetLock(
      {
        indexes: { [PROFILE_ENGLISH_KEY]: createHostedAssetLockObject(PROFILE_ENGLISH_KEY, createHash("b")) },
        objects: { [STATS_WEAPONS_KEY]: createHostedAssetLockObject(STATS_WEAPONS_KEY, createHash("a")) },
      },
      lockPath,
    );

    await commitHostedAssetLock(product, [GameDataset.BookBody], {
      indexes: { [BOOK_BODY_ENGLISH_KEY]: createHostedAssetLockObject(BOOK_BODY_ENGLISH_KEY, createHash("c")) },
      objects: {},
    });

    await expect(readHostedAssetLock(lockPath)).resolves.toStrictEqual({
      indexes: {
        [BOOK_BODY_ENGLISH_KEY]: createHostedAssetLockObject(BOOK_BODY_ENGLISH_KEY, createHash("c")),
        [PROFILE_ENGLISH_KEY]: createHostedAssetLockObject(PROFILE_ENGLISH_KEY, createHash("b")),
      },
      objects: { [STATS_WEAPONS_KEY]: createHostedAssetLockObject(STATS_WEAPONS_KEY, createHash("a")) },
    });
  });

  test("replaces the entries of the scopes it publishes", async () => {
    expect.hasAssertions();

    await writeHostedAssetLock(
      {
        indexes: { [PROFILE_ENGLISH_KEY]: createHostedAssetLockObject(PROFILE_ENGLISH_KEY, createHash("a")) },
        objects: { [STATS_WEAPONS_KEY]: createHostedAssetLockObject(STATS_WEAPONS_KEY, createHash("b")) },
      },
      lockPath,
    );

    await commitHostedAssetLock(product, [GameDataset.Profile], {
      indexes: { [PROFILE_ENGLISH_KEY]: createHostedAssetLockObject(PROFILE_ENGLISH_KEY, createHash("c")) },
      objects: {},
    });

    await expect(readHostedAssetLock(lockPath)).resolves.toStrictEqual({
      indexes: { [PROFILE_ENGLISH_KEY]: createHostedAssetLockObject(PROFILE_ENGLISH_KEY, createHash("c")) },
      objects: { [STATS_WEAPONS_KEY]: createHostedAssetLockObject(STATS_WEAPONS_KEY, createHash("b")) },
    });
  });

  // A fit republishes one key of a dataset whose other keys another step wrote
  test("replaces only the key a key scope names", async () => {
    expect.hasAssertions();

    const doorKey = `${GameDataset.Login}/door` as const;
    const musicKey = `${GameDataset.Login}/music` as const;
    await writeHostedAssetLock(
      {
        indexes: {},
        objects: {
          [doorKey]: createHostedAssetLockObject(doorKey, createHash("a")),
          [musicKey]: createHostedAssetLockObject(musicKey, createHash("b")),
        },
      },
      lockPath,
    );

    await commitHostedAssetLock(product, [musicKey], {
      indexes: {},
      objects: { [musicKey]: createHostedAssetLockObject(musicKey, createHash("c")) },
    });

    await expect(readHostedAssetLock(lockPath)).resolves.toStrictEqual({
      indexes: {},
      objects: {
        [doorKey]: createHostedAssetLockObject(doorKey, createHash("a")),
        [musicKey]: createHostedAssetLockObject(musicKey, createHash("c")),
      },
    });
  });
});
