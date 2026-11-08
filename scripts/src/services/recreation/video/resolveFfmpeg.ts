import { FFMPEG_MACOS_PINNED_TOOL, FFMPEG_WINDOWS_PINNED_TOOL } from "#src/services/recreation/video/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";

// The pinned FFmpeg, fetched and unpacked the first time it is needed: jellyfin's build on a Mac, and Gyan's on Windows,
// As the vgmstream stage does. Elsewhere there is no pinned build, so the FFmpeg on the PATH stands in
export const resolveFfmpeg = (): Promise<string> => {
  if (process.platform === "darwin") return resolvePinnedTool(FFMPEG_MACOS_PINNED_TOOL);
  if (process.platform === "win32") return resolvePinnedTool(FFMPEG_WINDOWS_PINNED_TOOL);
  return Promise.resolve("ffmpeg");
};
