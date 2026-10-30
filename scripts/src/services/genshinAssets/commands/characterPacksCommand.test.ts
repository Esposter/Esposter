import type { CharacterPackFile } from "#src/models/genshinAssets/characterPacks/CharacterPackFile";
import type { CharacterPackIndex } from "genshin-world";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildCharacterPackIndex } from "#src/services/genshinAssets/characterPacks/buildCharacterPackIndex";
import { publishCharacterPacks } from "#src/services/genshinAssets/characterPacks/publishCharacterPacks";
import { characterPacksCommand } from "#src/services/genshinAssets/commands/characterPacksCommand";
import { defineCommand, runCommand } from "citty";
import { GameDataset } from "genshin-world";
import { afterEach, describe, expect, test, vi } from "vitest";

const SHA256 = "a".repeat(64);
const FILES: CharacterPackFile[] = [
  { avatarId: "10000006", blobName: "characterPacks/10000006/body.png", localPath: "", path: "body.png", size: 4 },
];
const INDEX: CharacterPackIndex = {
  avatars: [
    { avatarId: 10000006, files: [{ bytes: 4, path: "body.png", sha256: SHA256 }], name: "丽莎" },
    {
      avatarId: 10000007,
      files: [
        { bytes: 5, path: "hair.png", sha256: SHA256 },
        { bytes: 3, path: "manifest.json", sha256: SHA256 },
      ],
      name: "女主角",
    },
  ],
};

vi.mock(import("#src/services/gameData/publishGameDataStep"), () => ({
  publishGameDataStep: vi.fn<(options: unknown) => Promise<string>>(() => Promise.resolve("published")),
}));
vi.mock(import("#src/services/genshinAssets/characterPacks/publishCharacterPacks"), () => ({
  publishCharacterPacks: vi.fn<(files: CharacterPackFile[]) => Promise<void>>(() => Promise.resolve()),
}));
vi.mock(import("#src/services/genshinAssets/characterPacks/readCharacterPackFiles"), () => ({
  readCharacterPackFiles: vi.fn<(directory: string) => Promise<CharacterPackFile[]>>(() => Promise.resolve(FILES)),
}));
vi.mock(import("#src/services/genshinAssets/characterPacks/buildCharacterPackIndex"), () => ({
  buildCharacterPackIndex: vi.fn<(files: CharacterPackFile[]) => Promise<CharacterPackIndex>>(() =>
    Promise.resolve(INDEX),
  ),
}));

const runCharacterPacks = (rawArgs: string[]) =>
  runCommand(defineCommand({ subCommands: { "character-packs": characterPacksCommand } }), {
    rawArgs: ["character-packs", ...rawArgs],
  });

describe("characterPacksCommand", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // The dry run states the index's avatars and bytes, and asks the game data step for its change without a request
  test("dry run reports the index and writes nothing", async () => {
    expect.hasAssertions();

    const log = vi.spyOn(console, "log").mockReturnValue(undefined);
    await runCharacterPacks(["--dry-run"]);

    expect(log).toHaveBeenCalledWith(expect.stringContaining("2 avatars, 12 bytes"));
    expect(vi.mocked(publishCharacterPacks)).not.toHaveBeenCalled();
    expect(vi.mocked(publishGameDataStep).mock.calls[0]?.[0]).toStrictEqual({
      isDryRun: true,
      publication: { indexes: {}, objects: { [`${GameDataset.CharacterPackIndex}/index`]: INDEX } },
      scopes: [GameDataset.CharacterPackIndex],
    });
  });

  // The files upload before the index is published, so the index never names a file an account does not hold
  test("a publish uploads the files before it publishes the index", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "log").mockReturnValue(undefined);
    await runCharacterPacks([]);

    expect(vi.mocked(publishCharacterPacks).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(publishGameDataStep).mock.invocationCallOrder[0] ?? 0,
    );
    expect(vi.mocked(buildCharacterPackIndex)).toHaveBeenCalledWith(FILES);
  });
});
