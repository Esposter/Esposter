import { YT_DLP_PINNED_TOOL } from "#src/services/recreation/video/constants";
import { ASSET_HASH_REGEX } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("constants", () => {
  test("is a bare executable from a GitHub release", () => {
    expect.hasAssertions();

    const { archiveSha256, archiveUrl, executablePattern, isArchive } = YT_DLP_PINNED_TOOL;

    expect(archiveSha256).toMatch(ASSET_HASH_REGEX);
    expect(new URL(archiveUrl).hostname).toBe("github.com");
    expect(executablePattern).toBe("yt-dlp.exe");
    expect(isArchive).toBe(false);
  });
});
