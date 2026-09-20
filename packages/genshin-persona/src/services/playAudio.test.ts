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

    playAudio(new Uint8Array());

    expect(spawnSync).toHaveBeenCalledTimes(1);
    expect(spawnSync.mock.calls[0]?.[2]).toStrictEqual({ windowsHide: true });
    expect(existsSync(join(tmpdir(), `genshin-persona-${process.pid}.wav`))).toBe(false);
  });
});
