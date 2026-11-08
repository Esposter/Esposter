import { resolveVgmstream } from "#src/services/genshinAssets/music/resolveVgmstream";
import {
  VGMSTREAM_MACOS_PINNED_TOOL,
  VGMSTREAM_WINDOWS_PINNED_TOOL,
} from "#src/services/genshinAssets/shared/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/resolvePinnedTool"), () => ({ resolvePinnedTool: vi.fn() }));

const PINNED_PATH = "/cache/vgmstream/vgmstream-cli";
const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");

describe(resolveVgmstream, () => {
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

  test("a stage ignores a tool of the same name on the path and runs its pinned install", async () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "darwin" });

    expect(await resolveVgmstream()).toBe(PINNED_PATH);
  });
});
