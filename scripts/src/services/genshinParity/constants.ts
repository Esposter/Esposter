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
// The world package's parity page (`pnpm -C packages/genshin-world parity`), which renders a screen without Nuxt
export const PARITY_PAGE_URL = "http://localhost:3002/parity/?screen=";
export const GAME_EXECUTABLE_PATH: string = String.raw`C:\Program Files\Genshin Impact\Genshin Impact game\GenshinImpact.exe`;
export const GAME_WINDOW_TITLE = "Genshin Impact";
// The game lays its interface out for a 1080-pixel-high screen and scales it with the height, so a shot is taken at
// That height in CSS pixels and scaled to the reference's
export const INTERFACE_HEIGHT = 1080;
export const RECORD_FRAME_RATE = 30;
// What ffmpeg samples; everything else is an image sharp reads, animated or not
export const VIDEO_EXTENSIONS: ReadonlySet<string> = new Set([".mkv", ".mov", ".mp4", ".webm"]);
export const CONTACT_SHEET_COLUMNS = 6;
export const CONTACT_SHEET_CELL_WIDTH = 320;
// Each image of a comparison is drawn this high, side by side
export const COMPARISON_HEIGHT = 540;
