import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { FFMPEG_MACOS_PINNED_TOOL, FFMPEG_WINDOWS_PINNED_TOOL } from "#src/services/recreation/video/constants";
import { resolveFfmpeg } from "#src/services/recreation/video/resolveFfmpeg";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/resolvePinnedTool"), () => ({
  resolvePinnedTool: vi.fn<(pinnedTool: PinnedTool) => Promise<string>>(),
}));

describe(resolveFfmpeg, () => {
  const PINNED_PATH = "/cache/ffmpeg/ffmpeg";
  const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");

  beforeEach(() => {
    vi.mocked(resolvePinnedTool).mockResolvedValue(PINNED_PATH);
  });

  afterEach(() => {
    if (originalPlatform) Object.defineProperty(process, "platform", originalPlatform);
  });

  test("a macos run installs the pinned macos archive, never the windows one", async () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "darwin" });
    await resolveFfmpeg();

    expect(resolvePinnedTool).toHaveBeenCalledExactlyOnceWith(FFMPEG_MACOS_PINNED_TOOL);
  });

  test("a windows run installs the pinned windows archive", async () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "win32" });
    await resolveFfmpeg();

    expect(resolvePinnedTool).toHaveBeenCalledExactlyOnceWith(FFMPEG_WINDOWS_PINNED_TOOL);
  });

  test("a linux run takes the ffmpeg on the PATH, never a windows archive its tar cannot unpack", async () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "linux" });

    await expect(resolveFfmpeg()).resolves.toBe("ffmpeg");
    expect(resolvePinnedTool).not.toHaveBeenCalled();
  });

  test("a stage ignores a tool of the same name on the PATH", async () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "darwin" });

    await expect(resolveFfmpeg()).resolves.toBe(PINNED_PATH);
  });
});
