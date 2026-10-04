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
export const FILMS_DIRECTORY: string = join(PARITY_DIRECTORY, "films");
// A frame at 60 a second, the step a faked clock is moved by
export const PARITY_FRAME_MS: number = 1000 / 60;
export const COMPARISONS_DIRECTORY: string = join(PARITY_DIRECTORY, "comparisons");
// Each reference's witness G-buffer, its targets as raw floats beside a header and a preview
export const GBUFFER_DIRECTORY: string = join(PARITY_DIRECTORY, "gbuffer");
// Each family's parts drawn from straight above, a surface's design in metres
export const PLANS_DIRECTORY: string = join(PARITY_DIRECTORY, "plans");
// FFmpeg, pinned to one release and its checksum and unpacked inside the checkout the first time the tool needs it:
// Window capture (`gfxcapture`, Windows Graphics Capture) arrived in FFmpeg 8, which no npm package bundles, and this
// One build serves every other job the tool gives FFmpeg too. Gyan's releases are versioned and kept
export const FFMPEG_DIRECTORY: string = join(REPOSITORY_ROOT, "scripts", "node_modules", ".cache", "ffmpeg");
export const FFMPEG_ARCHIVE_URL =
  "https://github.com/GyanD/codexffmpeg/releases/download/9.0.2/ffmpeg-9.0.2-essentials_build.zip";
export const FFMPEG_ARCHIVE_SHA256 = "60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba";
// The archive is a hundred-odd megabytes, so its download is bounded by minutes rather than the usual seconds
export const FFMPEG_DOWNLOAD_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// The world package's parity page (`pnpm -C packages/genshin-world parity`), which renders a screen without Nuxt, on
// Its own port unless `GENSHIN_PARITY_PORT` names another: a second checkout's page, while a long solve holds the first
// oxlint-disable-next-line typescript/no-inferrable-types -- isolated declarations need a template literal's type written
export const PARITY_PAGE_URL: string = `http://localhost:${process.env.GENSHIN_PARITY_PORT ?? "3002"}/parity/?screen=`;
// The name a backdrop is served to the parity page under, which the page is told in its query
export const PARITY_BACKDROP_FILE = "parity-backdrop.png";
// Where a witness's files are served to the page: its layout, which the page is told of, and its meshes and textures
// Under the same folder by their export folders (`Mesh/<name>.obj`, `Texture2D/<name>.png`)
export const WITNESS_PATH_PREFIX = "/witness-exports/";
export const WITNESS_LAYOUT_PATH = "layout.json";
export const GAME_EXECUTABLE_PATH: string = String.raw`C:\Program Files\Genshin Impact\Genshin Impact game\GenshinImpact.exe`;
export const GAME_EXECUTABLE_NAME = "GenshinImpact.exe";
// The game lays its interface out for a 1080-pixel-high screen and scales it with the height, so a shot is taken at
// That height in CSS pixels and scaled to the reference's
export const INTERFACE_HEIGHT = 1080;
export const RECORD_FRAME_RATE = 60;
// A session long enough for a handful of screens and their motion, and short enough to sample quickly
export const RECORD_DEFAULT_SECONDS: number = Temporal.Duration.from({ minutes: 2 }).total("seconds");
// Encoded on the GPU (this machine's AMD card, through AMF) so the game keeps the CPU and its timing, at a constant
// Quantiser low enough that edges and colours measure as the game drew them. The frames are converted to BT.709
// Limited-range YUV and labelled so first: handed the window's BGRA, AMF converts to limited range itself but labels
// The stream full range, and every value then reads squeezed, white as 234
export const RECORD_ENCODING: string[] = [
  "-vf",
  "scale=out_range=tv:out_color_matrix=bt709,format=yuv420p",
  "-color_range",
  "tv",
  "-colorspace",
  "bt709",
  "-c:v",
  "h264_amf",
  "-rc",
  "cqp",
  "-qp_i",
  "12",
  "-qp_p",
  "12",
];
// What ffmpeg samples; everything else is an image sharp reads, animated or not
export const VIDEO_EXTENSIONS: ReadonlySet<string> = new Set([".mkv", ".mov", ".mp4", ".webm"]);
export const CONTACT_SHEET_COLUMNS = 6;
export const CONTACT_SHEET_CELL_WIDTH = 320;
// Each image of a comparison is drawn this high, side by side
export const COMPARISON_HEIGHT = 540;
// The contact sheet `frames` writes beside its frames, which is not one of them
export const CONTACT_SHEET_NAME = "sheet.png";
// The committed report of every reference's last scores, beside the map naming them
export const PARITY_SCORES_PATH: string = join(
  REPOSITORY_ROOT,
  "scripts",
  "src",
  "services",
  "genshinParity",
  "shared",
  "ParityReferenceMap.snapshot.md",
);
// A scene's structure is read at this width, small enough that its texture is gone and its shapes and light remain
export const STRUCTURE_WIDTH = 480;
// The width the cloud tools read a sky at: wide enough that a cloud's painted edge spans several pixels
export const CLOUDS_WIDTH = 960;
// The heights over the horizon, in degrees, the sky's cover is read between band by band: the cloud sea's billows and
// The bank along the horizon low, the cumulus over the towers' crowns high
export const CLOUD_ELEVATION_BANDS: number[] = [0, 3, 8, 15, 25, 90];
// The colours a preview and an overlay draw each family of a scene's parts in, by its index, distinct on any ground
export const FAMILY_COLORS: readonly [number, number, number][] = [
  [230, 25, 75],
  [60, 180, 75],
  [255, 225, 25],
  [0, 130, 200],
  [245, 130, 48],
  [145, 30, 180],
  [70, 240, 240],
  [240, 50, 230],
];
// A camera pose as the witness tools take it: the eye's x, y and z in three's axes, its heading and pitch in degrees,
// And its vertical field of view in degrees
export const CAMERA_POSE_AXES = ["x", "y", "z", "yaw", "pitch", "fov"] as const;
// FLIP's default viewing: 0.7 metres from a 0.7 metre wide screen of 3840 pixels, about 67 pixels a degree, which a
// Frame scored at another width stands for by its share of that screen
export const FLIP_SCREEN_WIDTH = 3840;
export const FLIP_PIXELS_PER_DEGREE: number = 0.7 * (FLIP_SCREEN_WIDTH / 0.7) * (Math.PI / 180);
// The layer of a scene's pixels no part covers: the sky, its clouds and whatever the scene draws past its parts
export const SKY_LAYER = "sky";
// A sky pixel the reference shows at least this many times as bright as our clear sky is one of its clouds
export const CLOUD_BRIGHTNESS_RATIO = 1.4;
// A recording's or a sound's pitch classes are read at 12 kHz, mono, in frames of 4096 samples a tenth of a second
// Apart, over 60 Hz to 2.5 kHz, where a mix's notes carry their pitch; a frame quieter than a fiftieth of the loudest
// Is left out of a match, and a match compares twenty seconds of a recording at a time
export const CHROMA_SAMPLE_RATE = 12000;
export const CHROMA_FRAME_LENGTH = 4096;
export const CHROMA_HOP_LENGTH = 1200;
export const CHROMA_MIN_FREQUENCY = 60;
export const CHROMA_MAX_FREQUENCY = 2500;
export const CHROMA_QUIET_SHARE = 0.02;
export const CHROMA_MATCH_SECONDS: number = Temporal.Duration.from({ seconds: 20 }).total("seconds");
// Music is scored at 22.05 kHz, where its octave bands from 63 Hz to 8 kHz all fit, each band's level in decibels read
// In the pitch classes' own frames, a level more than 60 dB under the game's loudest in that band read as that floor
export const LISTEN_SAMPLE_RATE = 22050;
export const LISTEN_BAND_CENTRES: number[] = [63, 125, 250, 500, 1000, 2000, 4000, 8000];
export const LISTEN_FLOOR_DECIBELS = 60;
// The screen that plays the login's music, which the parity page renders it through
export const LOGIN_MUSIC_SCREEN = "LoginMusic";
// A frame whose whole power rises by half again over the last is a note's attack, where `bands` weighs a band's power
export const BANDS_ONSET_RISE = 1.5;
// The ages in seconds since the last note began that `decay` reads a band's gap between: the attack, its first
// Decay, the note held, and the ring after it
export const DECAY_AGE_BOUNDS: number[] = [
  { milliseconds: 100 },
  { milliseconds: 250 },
  { milliseconds: 500 },
  { seconds: 1 },
].map((bound) => Temporal.Duration.from(bound).total("seconds"));
// A band's level this far over the frame before is a jump `attacks` counts, a doubling of its amplitude within a frame
export const LISTEN_ATTACK_RISE_DECIBELS = 6;
// The committed report of each music segment's last `listen`
export const PARITY_MUSIC_SCORES_PATH: string = join(
  REPOSITORY_ROOT,
  "scripts",
  "src",
  "services",
  "genshinParity",
  "shared",
  "ParityMusicScores.snapshot.md",
);
export const CHANNELS = [0, 1, 2] as const;
export const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;
