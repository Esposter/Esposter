import type { spawnSync as baseSpawnSync } from "@esposter/shared-node/child-process";

import { downloadClip } from "#src/services/recreation/video/downloadClip";
import { resolveFfmpeg } from "#src/services/recreation/video/resolveFfmpeg";
import { resolveYtDlp } from "#src/services/recreation/video/resolveYtDlp";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

type SpawnSyncStub = (
  command: string,
  clipArguments: readonly string[],
) => { error?: Error; status: number; stdout: string };

vi.mock(import("#src/services/recreation/video/resolveFfmpeg"), () => ({
  resolveFfmpeg: vi.fn<() => Promise<string>>(),
}));
vi.mock(import("#src/services/recreation/video/resolveYtDlp"), () => ({
  resolveYtDlp: vi.fn<() => Promise<string>>(),
}));
const { spawnSync } = vi.hoisted(() => ({ spawnSync: vi.fn<SpawnSyncStub>() }));

vi.mock(import("@esposter/shared-node/child-process"), () => ({
  spawnSync: spawnSync as unknown as typeof baseSpawnSync,
}));

// The output template yt-dlp is given, which names the folder the run downloads into
const outputOf = (clipArguments: readonly string[]): string => {
  const template = clipArguments[clipArguments.indexOf("--output") + 1];
  assert.exists(template);
  return template;
};

describe(downloadClip, () => {
  const url = "https://www.youtube.com/watch?v=KoebEnOmDWI";
  const clipName = "yt-KoebEnOmDWI-repro.mp4";
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "download-clip-test-"));
    vi.mocked(resolveFfmpeg).mockResolvedValue("ffmpeg");
    vi.mocked(resolveYtDlp).mockResolvedValue("yt-dlp");
    // The stand-in for yt-dlp: it writes the clip where its output template names it, and prints that path as the real
    // Run does
    vi.mocked(spawnSync).mockImplementation((_command, clipArguments) => {
      const path = outputOf(clipArguments).replace("%(id)s", "KoebEnOmDWI").replace("%(ext)s", "mp4");
      writeFileSync(path, "clip");
      return { status: 0, stdout: `${path}\n` };
    });
  });
  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
    vi.resetAllMocks();
  });

  test("two runs of one clip each download into a folder of their own, never a partial file they share", async () => {
    expect.hasAssertions();

    await downloadClip(url, 0, 3, "repro", directory);
    await downloadClip(url, 0, 3, "repro", directory);

    const folders = vi.mocked(spawnSync).mock.calls.map(([, clipArguments]) => dirname(outputOf(clipArguments)));
    expect(folders).not.toContain(directory);
    expect(new Set(folders).size).toBe(2);
  });

  test("a finished clip is moved into the directory under its name, and its run folder is removed", async () => {
    expect.hasAssertions();

    const path = await downloadClip(url, 0, 3, "repro", directory);

    expect(path).toBe(join(directory, clipName));
    expect(readdirSync(directory)).toStrictEqual([clipName]);
  });

  test("a run yt-dlp fails leaves no folder of its own behind, and throws its exit", async () => {
    expect.hasAssertions();

    vi.mocked(spawnSync).mockReturnValueOnce({ status: 1, stdout: "" });

    await expect(downloadClip(url, 0, 3, "repro", directory)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: https://www.youtube.com/watch?v=KoebEnOmDWI, exited with 1]`,
    );
    expect(readdirSync(directory)).toStrictEqual([]);
  });
});
