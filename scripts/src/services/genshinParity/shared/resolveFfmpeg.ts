import {
  FFMPEG_ARCHIVE_SHA256,
  FFMPEG_ARCHIVE_URL,
  FFMPEG_DIRECTORY,
} from "#src/services/genshinParity/shared/constants";
import { PINNED_TOOL_DOWNLOAD_TIMEOUT_MS } from "#src/services/shared/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";

// The pinned FFmpeg, fetched and unpacked the first time it is needed. The pinned build is a Windows executable, so off
// Windows the FFmpeg on the PATH stands in, which reads the same captures and frames
export const resolveFfmpeg = (): Promise<string> =>
  process.platform === "win32"
    ? resolvePinnedTool({
        archiveSha256: FFMPEG_ARCHIVE_SHA256,
        archiveUrl: FFMPEG_ARCHIVE_URL,
        directory: FFMPEG_DIRECTORY,
        downloadTimeoutMs: PINNED_TOOL_DOWNLOAD_TIMEOUT_MS,
        executablePattern: "*/bin/ffmpeg.exe",
        isArchive: true,
      })
    : Promise.resolve("ffmpeg");
