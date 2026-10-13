import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { PINNED_TOOL_DOWNLOAD_TIMEOUT_MS } from "#src/services/shared/constants";
import { CACHE_ROOT } from "@esposter/shared-node/cache";
import { join } from "node:path";

// FFmpeg, pinned to one release and its checksum and unpacked into the shared tool cache the first time a tool needs it. Gyan's
// Build is the one no npm package bundles, and it carries window capture (`gfxcapture`, Windows Graphics Capture) from
// FFmpeg 8. Its releases are versioned and kept apart
export const FFMPEG_DIRECTORY: string = join(CACHE_ROOT, "ffmpeg");
export const FFMPEG_ARCHIVE_URL =
  "https://github.com/GyanD/codexffmpeg/releases/download/9.0.2/ffmpeg-9.0.2-essentials_build.zip";
export const FFMPEG_ARCHIVE_SHA256 = "60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba";
// The yt-dlp that reads public videos, pinned to one release and its checksum: the standalone Windows build is the
// Executable itself, not an archive, and its folder is named for the release so a bump never reuses the old one. The
// Pinned FFmpeg merges the streams it downloads
export const YT_DLP_DIRECTORY: string = join(CACHE_ROOT, "yt-dlp", "2026.08.19");
export const YT_DLP_PINNED_TOOL: PinnedTool = {
  archiveSha256: "66674953fe251b89f4d08c5f0e35e0728679bd67ab3d7d05c0562af101dd3e7a",
  archiveUrl: "https://github.com/yt-dlp/yt-dlp/releases/download/2026.08.19/yt-dlp.exe",
  directory: YT_DLP_DIRECTORY,
  downloadTimeoutMs: PINNED_TOOL_DOWNLOAD_TIMEOUT_MS,
  executablePattern: "yt-dlp.exe",
  isArchive: false,
};
// The most a search's output may run to: the fields it prints for each result, read whole as one string
export const SEARCH_MAX_BUFFER_BYTES: number = 64 * 1024 * 1024;
// A clip's name is a file name's part of letters, digits and dashes
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const CLIP_NAME_REGEX: RegExp = /^[\w-]+$/u;
export const CONTACT_SHEET_COLUMNS = 6;
export const CONTACT_SHEET_CELL_WIDTH = 320;
