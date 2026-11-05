import type { ParityRecordingManifestRow } from "#src/models/genshinParity/reference/ParityRecordingManifestRow";
import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";

import { referencesRestoreCommand } from "#src/services/genshinParity/commands/referencesRestoreCommand";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { defineCommand, runCommand } from "citty";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/reference/readManifestFile"), () => ({
  readManifestFile: vi.fn<() => Promise<ParityReferenceManifest>>(),
}));
vi.mock(import("#src/services/genshinParity/reference/restoreManifestFiles"), () => ({
  restoreManifestFiles: vi.fn<() => Promise<{ fetched: number; held: number }>>(() =>
    Promise.resolve({ fetched: 0, held: 0 }),
  ),
}));

describe("referencesRestoreCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The printed line is copied from the repository root into a shell, where a YouTube url's `?` is a glob unless it is
  // Quoted, so its source is quoted and the command runs in `scripts` through its `-C` flag
  test("prints each public recording's clip command with its source quoted", async () => {
    expect.hasAssertions();

    const recording: ParityRecordingManifestRow = {
      attribution: {},
      bytes: 3,
      name: "yt-abcdefghijk-expedition-screen.mp4",
      range: { end: 60, start: 0 },
      sha256: "a".repeat(64),
      source: "https://www.youtube.com/watch?v=abcdefghijk",
      sourceFormat: "mp4",
    };
    vi.mocked(readManifestFile).mockResolvedValue({ recordings: [recording], records: [], references: [] });
    const log = vi.spyOn(console, "log").mockReturnValue(undefined);

    await runCommand(defineCommand({ subCommands: { restore: referencesRestoreCommand } }), { rawArgs: ["restore"] });

    expect(log).toHaveBeenLastCalledWith(
      `next  pnpm -C scripts genshin:parity recordings clip "https://www.youtube.com/watch?v=abcdefghijk" --from 0 --to 60 --name expedition-screen`,
    );
  });
});
