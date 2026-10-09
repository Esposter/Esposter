import type { CharacterPack } from "#src/models/genshinCharacters/CharacterPack";
import type { CharacterPackFile } from "#src/models/genshinCharacters/CharacterPackFile";
import type { ContainerClient } from "@azure/storage-blob";

import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { CharacterPackContentType } from "#src/models/genshinCharacters/CharacterPackContentType";
import { DAY_MS } from "#src/services/gameData/constants";
import { getCharacterPackBlobName } from "#src/services/genshinCharacters/getCharacterPackBlobName";
import { publishCharacterPackToTarget } from "#src/services/genshinCharacters/publishCharacterPackToTarget";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const getBody = (file: CharacterPackFile) => Promise.resolve(file.body);

describe(publishCharacterPackToTarget, () => {
  const containerClient = new MockContainerClient("", GameDataTarget.Dev) as unknown as ContainerClient;
  const pack: CharacterPack = {
    characterId: 0,
    files: [
      {
        body: Buffer.from(""),
        contentType: CharacterPackContentType.OctetStream,
        hash: "",
        isCompressed: false,
        path: "a",
      },
    ],
    manifest: { files: {} },
    notes: [],
    packHash: "",
  };
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
  });

  test("stores each file under its pack's hash, and a rerun writes none while they are young", async () => {
    expect.hasAssertions();

    const writtenCounts = [
      await publishCharacterPackToTarget(containerClient, pack, getBody),
      await publishCharacterPackToTarget(containerClient, pack, getBody),
    ];

    expect(writtenCounts).toStrictEqual([1, 0]);
    expect([...(MockContainerDatabase.get(GameDataTarget.Dev)?.keys() ?? [])]).toStrictEqual([
      getCharacterPackBlobName(0, "", "a"),
    ]);
  });

  // An old copy is rewritten so its age restarts, or a prune could take it before the lock names its pack
  test("rewrites a file stored past the reuse window", async () => {
    expect.hasAssertions();

    await publishCharacterPackToTarget(containerClient, pack, getBody);
    vi.setSystemTime(90 * DAY_MS);

    await expect(publishCharacterPackToTarget(containerClient, pack, getBody)).resolves.toBe(1);
  });
});
