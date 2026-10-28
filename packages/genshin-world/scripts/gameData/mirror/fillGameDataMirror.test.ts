import { GAME_DATA_MIRROR_SOURCE_URL } from "#scripts/gameData/mirror/constants";
import { downloadGameDataObject } from "#scripts/gameData/mirror/downloadGameDataObject";
import { fillGameDataMirror } from "#scripts/gameData/mirror/fillGameDataMirror";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#scripts/gameData/mirror/downloadGameDataObject"), () => ({
  downloadGameDataObject: vi.fn<typeof downloadGameDataObject>(),
}));

const getHash = (json: string): string => createHash("sha256").update(json).digest("hex");

describe(fillGameDataMirror, () => {
  let mirrorDirectory: string;

  beforeEach(async () => {
    mirrorDirectory = await mkdtemp(join(tmpdir(), "game-data-mirror-"));
  });

  afterEach(async () => {
    vi.mocked(downloadGameDataObject).mockReset();
    await rm(mirrorDirectory, { force: true, recursive: true });
  });

  // A mirror saved for the shards holds the entries an index names, which the lock itself never lists
  test("fills the lock's objects, its indexes and every entry they name", async () => {
    expect.hasAssertions();

    const objectJson = "0";
    const entryJson = "1";
    const indexJson = JSON.stringify({ 0: getHash(entryJson) });
    const jsonMap = new Map([objectJson, entryJson, indexJson].map((json) => [getHash(json), json]));
    vi.mocked(downloadGameDataObject).mockImplementation((url) =>
      Promise.resolve(Buffer.from(jsonMap.get(basename(url, ".json")) ?? "")),
    );

    await expect(
      fillGameDataMirror(
        { indexes: { index: getHash(indexJson) }, objects: { object: getHash(objectJson) } },
        mirrorDirectory,
      ),
    ).resolves.toBe(3);
    expect((await readdir(mirrorDirectory)).toSorted()).toStrictEqual([...jsonMap.keys()].toSorted());
    // Each object is fetched from the path its dataset stores it under, and an entry under its index's key
    expect(
      vi
        .mocked(downloadGameDataObject)
        .mock.calls.map(([url]) => url)
        .toSorted(),
    ).toStrictEqual(
      [
        `${GAME_DATA_MIRROR_SOURCE_URL}/index/${getHash(indexJson)}.json`,
        `${GAME_DATA_MIRROR_SOURCE_URL}/index/${getHash(entryJson)}.json`,
        `${GAME_DATA_MIRROR_SOURCE_URL}/object/${getHash(objectJson)}.json`,
      ].toSorted(),
    );
  });
});
