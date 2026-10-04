import {
  FFMPEG_ARCHIVE_SHA256,
  FFMPEG_ARCHIVE_URL,
  FFMPEG_DIRECTORY,
  FFMPEG_DOWNLOAD_TIMEOUT_MS,
} from "#src/services/genshinParity/shared/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";

// The pinned FFmpeg, fetched and unpacked the first time it is needed
export const resolveFfmpeg = (): Promise<string> =>
  resolvePinnedTool({
    archiveSha256: FFMPEG_ARCHIVE_SHA256,
    archiveUrl: FFMPEG_ARCHIVE_URL,
    directory: FFMPEG_DIRECTORY,
    downloadTimeoutMs: FFMPEG_DOWNLOAD_TIMEOUT_MS,
    executablePattern: "*/bin/ffmpeg.exe",
  });
