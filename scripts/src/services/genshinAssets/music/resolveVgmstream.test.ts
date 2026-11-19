import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { resolveVgmstream } from "#src/services/genshinAssets/music/resolveVgmstream";
import {
  VGMSTREAM_MACOS_PINNED_TOOL,
  VGMSTREAM_WINDOWS_PINNED_TOOL,
} from "#src/services/genshinAssets/shared/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { installPinnedTool } from "#src/services/shared/installPinnedTool";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/resolvePinnedTool"), () => ({
  resolvePinnedTool: vi.fn<(pinnedTool: PinnedTool) => Promise<string>>(),
}));
vi.mock(import("#src/services/shared/fetchOk"));

describe(resolveVgmstream, () => {
  const PINNED_PATH = "/cache/vgmstream/vgmstream-cli";
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
    await resolveVgmstream();

    expect(resolvePinnedTool).toHaveBeenCalledWith(VGMSTREAM_MACOS_PINNED_TOOL);
  });

  test("a windows run installs the pinned windows archive", async () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "win32" });
    await resolveVgmstream();

    expect(resolvePinnedTool).toHaveBeenCalledWith(VGMSTREAM_WINDOWS_PINNED_TOOL);
  });

  test("a stage ignores a tool of the same name on the PATH", async () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "darwin" });

    await expect(resolveVgmstream()).resolves.toBe(PINNED_PATH);
  });

  test("a tool whose archive fails its SHA-256 is refused", async () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "darwin" });
    vi.mocked(fetchOk).mockResolvedValue(new Response("not the pinned archive"));
    // The real installer runs here, so the refusal is the one a stage meets: its archive is checked before it is unpacked
    vi.mocked(resolvePinnedTool).mockImplementationOnce(installPinnedTool);

    await expect(resolveVgmstream()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://github.com/vgmstream/vgmstream/releases/download/r2117/vgmstream-mac.zip, has checksum 31336d9bb85e0c667eaf14a4d15c09de4e080feae928930ec0775a3ca5e8f9ef, not the pinned one]`,
    );
  });
});
