import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// Everything the tool fetches, records and draws lives here, outside the repository: the references are
// HoYoverse's images and are looked at, never committed
export const PARITY_DIRECTORY: string =
  process.env.GENSHIN_PARITY_DIRECTORY ?? join(homedir(), SITE_NAME, "genshin-parity");
export const REFERENCES_DIRECTORY: string = join(PARITY_DIRECTORY, "references");
export const FRAMES_DIRECTORY: string = join(PARITY_DIRECTORY, "frames");
export const CAPTURES_DIRECTORY: string = join(PARITY_DIRECTORY, "captures");
export const SHOTS_DIRECTORY: string = join(PARITY_DIRECTORY, "shots");
export const COMPARISONS_DIRECTORY: string = join(PARITY_DIRECTORY, "comparisons");
// FFmpeg, pinned to one release and its checksum and unpacked inside the checkout the first time the tool needs it:
// Window capture (`gfxcapture`, Windows Graphics Capture) arrived in FFmpeg 8, which no npm package bundles, and this
// One build serves every other job the tool gives FFmpeg too. Gyan's releases are versioned and kept
export const FFMPEG_DIRECTORY: string = join(REPOSITORY_ROOT, "scripts", "node_modules", ".cache", "ffmpeg");
export const FFMPEG_ARCHIVE_URL =
  "https://github.com/GyanD/codexffmpeg/releases/download/9.0.2/ffmpeg-9.0.2-essentials_build.zip";
export const FFMPEG_ARCHIVE_SHA256 = "60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba";
// The archive is a hundred-odd megabytes, so its download is bounded by minutes rather than the usual seconds
export const FFMPEG_DOWNLOAD_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// The world package's parity page (`pnpm -C packages/genshin-world parity`), which renders a screen without Nuxt
export const PARITY_PAGE_URL = "http://localhost:3002/parity/?screen=";
export const GAME_EXECUTABLE_PATH: string = String.raw`C:\Program Files\Genshin Impact\Genshin Impact game\GenshinImpact.exe`;
export const GAME_EXECUTABLE_NAME = "GenshinImpact.exe";
// The game lays its interface out for a 1080-pixel-high screen and scales it with the height, so a shot is taken at
// That height in CSS pixels and scaled to the reference's
export const INTERFACE_HEIGHT = 1080;
export const RECORD_FRAME_RATE = 60;
// A session long enough for a handful of screens and their motion, and short enough to sample quickly
export const RECORD_DEFAULT_SECONDS = 120;
// Encoded on the GPU (this machine's AMD card, through AMF) so the game keeps the CPU and its timing, at a constant
// Quantiser low enough that edges and colours measure as the game drew them
export const RECORD_ENCODING: string[] = ["-c:v", "h264_amf", "-rc", "cqp", "-qp_i", "12", "-qp_p", "12"];
// What ffmpeg samples; everything else is an image sharp reads, animated or not
export const VIDEO_EXTENSIONS: ReadonlySet<string> = new Set([".mkv", ".mov", ".mp4", ".webm"]);
export const CONTACT_SHEET_COLUMNS = 6;
export const CONTACT_SHEET_CELL_WIDTH = 320;
// Each image of a comparison is drawn this high, side by side
export const COMPARISON_HEIGHT = 540;
