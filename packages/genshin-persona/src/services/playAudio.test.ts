import type { spawnSync as baseSpawnSync } from "node:child_process";

import { playAudio } from "#src/services/playAudio";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

const { spawnSync } = vi.hoisted(() => ({ spawnSync: vi.fn<typeof baseSpawnSync>() }));

vi.mock(import("node:child_process"), () => ({ spawnSync: spawnSync as unknown as typeof baseSpawnSync }));

describe(playAudio, () => {
  test("runs the player with its window hidden, and deletes the WAV after", () => {
    expect.hasAssertions();

    spawnSync.mockReturnValueOnce({ status: 0 } as ReturnType<typeof baseSpawnSync>);

    expect(playAudio(new Uint8Array())).toBe("");
    expect(spawnSync).toHaveBeenCalledTimes(1);
    expect(spawnSync.mock.calls[0]?.[2]).toStrictEqual({ windowsHide: true });
    expect(existsSync(join(tmpdir(), `genshin-persona-${process.pid}.wav`))).toBe(false);
  });

  test.each([
    { expected: "playAudio", name: "a player that could not be spawned", outcome: { error: new Error("playAudio") } },
    { expected: "the player exited 1", name: "a player that refused the file", outcome: { status: 1 } },
    {
      expected: "the player was stopped by SIGKILL",
      name: "a player the OS stopped",
      outcome: { signal: "SIGKILL", status: null },
    },
  ])("answers $name with why", ({ expected, outcome }) => {
    expect.hasAssertions();

    spawnSync.mockReturnValueOnce(outcome as ReturnType<typeof baseSpawnSync>);

    expect(playAudio(new Uint8Array())).toBe(expected);
  });
});
