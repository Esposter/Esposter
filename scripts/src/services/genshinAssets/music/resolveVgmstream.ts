import {
  VGMSTREAM_ARCHIVE_SHA256,
  VGMSTREAM_ARCHIVE_URL,
  VGMSTREAM_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { FFMPEG_DOWNLOAD_TIMEOUT_MS } from "#src/services/genshinParity/shared/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";

// The pinned vgmstream command line, fetched and unpacked the first time a sound is decoded
export const resolveVgmstream = (): Promise<string> =>
  resolvePinnedTool({
    archiveSha256: VGMSTREAM_ARCHIVE_SHA256,
    archiveUrl: VGMSTREAM_ARCHIVE_URL,
    directory: VGMSTREAM_DIRECTORY,
    downloadTimeoutMs: FFMPEG_DOWNLOAD_TIMEOUT_MS,
    executablePattern: "vgmstream-cli.exe",
  });
