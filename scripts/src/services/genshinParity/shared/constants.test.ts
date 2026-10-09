import { YT_DLP_PINNED_TOOL } from "#src/services/genshinParity/shared/constants";
import { basename } from "node:path";
import { describe, expect, test } from "vitest";

describe("constants", () => {
  test("is a bare executable whose release tag names the folder it is kept in", () => {
    expect.hasAssertions();

    const { archiveSha256, archiveUrl, directory, executablePattern, isArchive } = YT_DLP_PINNED_TOOL;

    expect(Object.keys(YT_DLP_PINNED_TOOL).toSorted()).toStrictEqual([
      "archiveSha256",
      "archiveUrl",
      "directory",
      "downloadTimeoutMs",
      "executablePattern",
      "isArchive",
    ]);
    expect(archiveSha256).toMatch(/^[\da-f]{64}$/u);
    expect(new URL(archiveUrl).hostname).toBe("github.com");
    expect(archiveUrl.split("/").at(-2)).toBe(basename(directory));
    expect(executablePattern).toBe("yt-dlp.exe");
    expect(isArchive).toBe(false);
  });
});
