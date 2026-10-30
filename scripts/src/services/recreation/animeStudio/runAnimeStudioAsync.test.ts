import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";
import type { spawn } from "@esposter/shared-node/child-process";

import { runAnimeStudioAsync } from "#src/services/recreation/animeStudio/runAnimeStudioAsync";
import { EventEmitter } from "node:events";
import { describe, expect, test, vi } from "vitest";

const { spawnMock } = vi.hoisted(() => ({ spawnMock: vi.fn<typeof spawn>() }));

vi.mock(import("@esposter/shared-node/child-process"), async (importOriginal) => ({
  ...(await importOriginal()),
  spawn: spawnMock as unknown as typeof spawn,
}));
vi.mock(import("#src/services/recreation/animeStudio/waitForFreeMemory"), () => ({
  waitForFreeMemory: () => Promise.resolve(undefined),
}));

describe(runAnimeStudioAsync, () => {
  // AnimeStudio skips what throws and exits 0 all the same, so a clean exit whose output names an exception still fails
  test("fails a below-normal run that exits 0 but logged an exception, as a run at normal priority does", async () => {
    expect.hasAssertions();

    spawnMock.mockImplementation(() => {
      const child = Object.assign(new EventEmitter(), {
        pid: undefined,
        stderr: new EventEmitter(),
        stdout: new EventEmitter(),
      }) as unknown as ReturnType<typeof spawn>;
      setImmediate(() => {
        child.stdout?.emit("data", Buffer.from("[Error] System.NullReferenceException: at x"));
        child.emit("close", 0);
      });
      return child;
    });
    const options: AnimeStudioOptions = {
      executableHint: "the AnimeStudio folder",
      executablePath: process.execPath,
      game: "GenshinImpact",
      indexCommand: "",
      indexPath: "",
    };

    await expect(runAnimeStudioAsync(["00/04949489.blk"], options, { belowNormal: true })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: AnimeStudio, exited 0 but threw 1 exception(s), skipping what threw:
      [Error] System.NullReferenceException: at x]
    `);
  });
});
