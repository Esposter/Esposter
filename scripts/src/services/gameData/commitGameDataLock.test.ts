import { commitGameDataLock } from "#src/services/gameData/commitGameDataLock";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { writeGameDataLock } from "#src/services/gameData/writeGameDataLock";
import { GameDataset } from "genshin-world";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const createHash = (character: string) => character.repeat(64);

describe(commitGameDataLock, () => {
  let lockPath: string;

  beforeEach(async () => {
    lockPath = join(await mkdtemp(join(tmpdir(), "game-data-lock-")), "gameDataLock.json");
  });

  afterEach(async () => {
    await rm(dirname(lockPath), { force: true, recursive: true });
  });

  // Another publication committed its scope while this one was uploading, and this commit must keep those entries
  test("keeps the entries another publication committed while this one was uploading", async () => {
    expect.hasAssertions();

    await writeGameDataLock(
      { indexes: { "profile/English": createHash("b") }, objects: { "stats/weapons": createHash("a") } },
      lockPath,
    );

    await commitGameDataLock(
      [GameDataset.BookBody],
      { indexes: { "bookBody/English": createHash("c") }, objects: {} },
      lockPath,
    );

    await expect(readGameDataLock(lockPath)).resolves.toStrictEqual({
      indexes: { "bookBody/English": createHash("c"), "profile/English": createHash("b") },
      objects: { "stats/weapons": createHash("a") },
    });
  });

  test("replaces the entries of the scopes it publishes", async () => {
    expect.hasAssertions();

    await writeGameDataLock(
      { indexes: { "profile/English": createHash("a") }, objects: { "stats/weapons": createHash("b") } },
      lockPath,
    );

    await commitGameDataLock(
      [GameDataset.Profile],
      { indexes: { "profile/English": createHash("c") }, objects: {} },
      lockPath,
    );

    await expect(readGameDataLock(lockPath)).resolves.toStrictEqual({
      indexes: { "profile/English": createHash("c") },
      objects: { "stats/weapons": createHash("b") },
    });
  });
});
