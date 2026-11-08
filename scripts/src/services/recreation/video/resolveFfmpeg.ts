import { FFMPEG_MACOS_PINNED_TOOL, FFMPEG_WINDOWS_PINNED_TOOL } from "#src/services/recreation/video/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";

// The pinned FFmpeg, fetched and unpacked the first time it is needed: jellyfin's build on a Mac, and Gyan's everywhere
// else, as the vgmstream stage does, since the fleet runs on Windows and macOS only
export const resolveFfmpeg = (): Promise<string> =>
  resolvePinnedTool(process.platform === "darwin" ? FFMPEG_MACOS_PINNED_TOOL : FFMPEG_WINDOWS_PINNED_TOOL);
