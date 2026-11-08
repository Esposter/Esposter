import {
  VGMSTREAM_MACOS_PINNED_TOOL,
  VGMSTREAM_WINDOWS_PINNED_TOOL,
} from "#src/services/genshinAssets/shared/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";

// The pinned vgmstream command line, fetched and unpacked the first time a sound is decoded: the macOS archive on a Mac,
// And the Windows archive everywhere else
export const resolveVgmstream = (): Promise<string> =>
  resolvePinnedTool(process.platform === "darwin" ? VGMSTREAM_MACOS_PINNED_TOOL : VGMSTREAM_WINDOWS_PINNED_TOOL);
