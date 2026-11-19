import type { GameDataLock } from "genshin-world";

import { verifyCommand } from "#src/services/gameData/commands/verifyCommand";
import { GAME_DATA_LOCK_REPOSITORY_PATH } from "#src/services/gameData/constants";
import { defineCommand, runCommand } from "citty";
import { afterEach, describe, expect, test, vi } from "vitest";

const { readGameDataLock } = vi.hoisted(() => ({ readGameDataLock: vi.fn<() => Promise<GameDataLock>>() }));
const { runGit } = vi.hoisted(() => ({ runGit: vi.fn<(args: string[]) => string>() }));

vi.mock(import("#src/services/gameData/readGameDataLock"), () => ({ readGameDataLock }));
vi.mock(import("#src/services/gameData/verifyGameData"), () => ({
  verifyGameData: vi.fn<() => Promise<number>>(() => Promise.resolve(1)),
}));
vi.mock(import("#src/services/shared/runGit"), () => ({ runGit }));

const verify = () => runCommand(defineCommand({ subCommands: { verify: verifyCommand } }), { rawArgs: ["verify"] });

describe("verifyCommand", () => {
  const HASH = "0".repeat(64);
  const OTHER_HASH = "1".repeat(64);

  afterEach(() => {
    vi.resetAllMocks();
  });

  // The lock a publish wrote on disk is compared with the one the repository commits, so a publish that was not
  // Committed fails here rather than in a checkout that reads another lock
  test("verify fails when the lock differs from the committed lock", async () => {
    expect.hasAssertions();

    readGameDataLock.mockResolvedValue({ indexes: {}, objects: { "stats/weapons": OTHER_HASH } });
    runGit.mockReturnValue(JSON.stringify({ indexes: {}, objects: { "stats/weapons": HASH } }));

    await expect(verify()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: game data lock, differs from the committed lock at object stats/weapons]`,
    );
  });

  test("verify passes when the lock matches the committed lock", async () => {
    expect.hasAssertions();

    const lock: GameDataLock = { indexes: {}, objects: { "stats/weapons": HASH } };
    readGameDataLock.mockResolvedValue(lock);
    runGit.mockReturnValue(JSON.stringify(lock));

    await verify();

    expect(runGit).toHaveBeenCalledExactlyOnceWith(["show", `HEAD:${GAME_DATA_LOCK_REPOSITORY_PATH}`]);
  });
});
