import { getWorktreeName } from "#src/services/genshinParity/shared/getWorktreeName";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// Everything the tool fetches, records and draws lives here, outside the repository.
// The exceptions are the references the map names, and the manifest that holds their provenance.
// Both are committed in the repository.
export const PARITY_DIRECTORY: string =
  process.env.GENSHIN_PARITY_DIRECTORY ?? join(homedir(), SITE_NAME, "genshin-parity");
// The scratch images that are never committed: the clean plates, the softness caches, and the wiki files a trace reads.
// The namecards and the interactive map are scratch as well.
// So are the reference files a machine has not yet packed (`references pack`).
export const REFERENCE_SCRATCH_DIRECTORY: string = join(PARITY_DIRECTORY, "references");
// The shots of each checkout, under its own name, so a worktree's compare never overwrites another checkout's shot
export const SHOTS_DIRECTORY: string = join(PARITY_DIRECTORY, "shots", getWorktreeName(REPOSITORY_ROOT));
// Each run of the frame stall measure: its states' frame times, programs and their growth, as JSON
export const STALLS_DIRECTORY: string = join(PARITY_DIRECTORY, "stalls");
// A frame at 60 a second, the step a faked clock is moved by
export const PARITY_FRAME_MS: number = 1000 / 60;
// A frame is slow past this many milliseconds, the line the stall and GPU summaries count by
export const SLOW_FRAME_MS = 50;
// How long a page may take to draw its first frame, a full window at 1080 high on a machine running several pages at
// Once taking near a minute, where Playwright's default half minute gave up on a page still loading
export const PARITY_READY_TIMEOUT_MS = 120_000;
export const COMPARISONS_DIRECTORY: string = join(PARITY_DIRECTORY, "comparisons");
// The share of an image under which a run of a glyph's ink, or of the paper its ink encloses, is a speck the source
// Carries
export const SPECK_SHARE = 0.0002;
// Each reference's witness G-buffer, its targets as raw floats beside a header and a preview
export const GBUFFER_DIRECTORY: string = join(PARITY_DIRECTORY, "gbuffer");
// Each family's parts drawn from straight above, a surface's design in metres
export const PLANS_DIRECTORY: string = join(PARITY_DIRECTORY, "plans");
// Each reference's surface pass drawn where its readings lie, ours beside the exports
export const SURFACES_DIRECTORY: string = join(PARITY_DIRECTORY, "surfaces");
// A whole-screen screenshot is at least this wide, and a 16:9 or 16:10 screen's aspect ratio sits between these two
export const WHOLE_SCREEN_MIN_WIDTH = 1280;
export const WHOLE_SCREEN_MIN_ASPECT_RATIO = 1.6;
export const WHOLE_SCREEN_MAX_ASPECT_RATIO = 1.9;
// The world package's parity page, which renders a screen without Nuxt. The shared checkout serves it on 3011, and a busy
// Port is taken by the next one up, so a command finds the page by probing from its first port (`resolveParityPageRoot`).
// `GENSHIN_PARITY_PORT` names a different first port, as a runner's worktree does for its own page
export const PARITY_DEFAULT_PORT = 3011;
// How many ports from the first one a command probes for the page, and how long each probe waits for an answer
export const PARITY_PORT_COUNT = 10;
export const PARITY_PROBE_TIMEOUT_MS = 1000;
// The title the parity page's HTML carries, which tells it apart from whatever else answers on a port
export const PARITY_PAGE_TITLE = "<title>Genshin parity</title>";
// The world package, whose parity page a load run builds for production and serves beside the dev server
export const GENSHIN_WORLD_DIRECTORY: string = join(REPOSITORY_ROOT, "packages", "genshin-world");
// The committed references' folder: each reference the map names is committed here, or beside its fixture variant's snapshot
export const REFERENCE_FILES_DIRECTORY: string = join(GENSHIN_WORLD_DIRECTORY, "parity", "references");
// The manifest of every reference the map names: each file's hash, size, dimensions, source and attribution.
// The committed files are checked against it.
export const REFERENCE_MANIFEST_PATH: string = join(REFERENCE_FILES_DIRECTORY, "manifest.json");
// The production build of the parity page: a folder inside that package, which git ignores, and the root task that builds it
export const PARITY_BUILD_DIRECTORY_NAME = "parity-build";
// The config the build and its preview read, relative to the package
export const PARITY_CONFIG_PATH = "parity/vite.config.ts";
// Vite's own entry, run by node from the world package's install, so neither a shell nor a package manager stands between
// The tool and the build
export const VITE_BIN_PATH: string = join(GENSHIN_WORLD_DIRECTORY, "node_modules", "vite", "bin", "vite.js");
// The browser keeps this many resource timings, so a page with more requests than that drops the rest from its load bench; the
// Parity page raises it before its first request
export const RESOURCE_TIMING_BUFFER_SIZE = 4096;
// The name a backdrop is served to the parity page under, which the page is told in its query
export const PARITY_BACKDROP_FILE = "parity-backdrop.png";
// Where a witness's files are served to the page: its layout, which the page is told of, and its meshes and textures
// Under the same folder by their export folders (`Mesh/<name>.obj`, `Texture2D/<name>.png`)
export const WITNESS_PATH_PREFIX = "/witness-exports/";
export const WITNESS_LAYOUT_PATH = "layout.json";
// The folder holding the installed game's `GenshinImpact_Data` and its `config.ini`, read from `GENSHIN_GAME_DIRECTORY` so
// A machine that installed the game elsewhere points the tooling at it. On macOS it defaults to the parity folder's own
// `game` copy, where the game is kept; elsewhere to the Windows install
export const GAME_DIRECTORY: string =
  process.env.GENSHIN_GAME_DIRECTORY ??
  (process.platform === "darwin"
    ? join(PARITY_DIRECTORY, "game")
    : String.raw`C:\Program Files\Genshin Impact\Genshin Impact game`);
export const GAME_EXECUTABLE_NAME = "GenshinImpact.exe";
export const GAME_EXECUTABLE_PATH: string = join(GAME_DIRECTORY, GAME_EXECUTABLE_NAME);
// The game lays its interface out for a 1080-pixel-high screen and scales it with the height, so a shot is taken at
// That height in CSS pixels and scaled to the reference's
export const INTERFACE_HEIGHT = 1080;
// How much a page's device ratio is lifted over its height's share of the interface's, past single precision's error
export const DEVICE_SCALE_MARGIN = 1e-6;
// The parity tooling's shared folder, which holds the reference map and the committed reports beside it
export const PARITY_SHARED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "scripts",
  "src",
  "services",
  "genshinParity",
  "shared",
);
// A scene's structure is read at this width, small enough that its texture is gone and its shapes and light remain
export const STRUCTURE_WIDTH = 480;
// The width the cloud tools read a sky at: wide enough that a cloud's painted edge spans several pixels
export const CLOUDS_WIDTH = 960;
// The heights over the horizon, in degrees, the sky's cover is read between band by band: the cloud sea's billows and
// The bank along the horizon low, the cumulus over the towers' crowns high
export const CLOUD_ELEVATION_BANDS: number[] = [0, 3, 8, 15, 25, 90];
// A camera pose as the witness tools take it: the eye's x, y and z in three's axes, its heading and pitch in degrees,
// And its vertical field of view in degrees
export const CAMERA_POSE_AXES = ["x", "y", "z", "yaw", "pitch", "fov"] as const;
// FLIP's default viewing: 0.7 metres from a 0.7 metre wide screen of 3840 pixels, about 67 pixels a degree, which a
// Frame scored at another width stands for by its share of that screen
export const FLIP_SCREEN_WIDTH = 3840;
export const FLIP_PIXELS_PER_DEGREE: number = 0.7 * (FLIP_SCREEN_WIDTH / 0.7) * (Math.PI / 180);
// The layer of a scene's pixels no part covers: the sky, its clouds and whatever the scene draws past its parts
export const SKY_LAYER = "sky";
// The layer the whole frame is scored as, every pixel counted
export const FRAME_LAYER = "frame";
// A recording's or a sound's pitch classes are read at 12 kHz, mono, in frames of 4096 samples a tenth of a second
// Apart, over 60 Hz to 2.5 kHz, where a mix's notes carry their pitch; a frame quieter than a fiftieth of the loudest
// Is left out of a match, and a match compares twenty seconds of a recording at a time
export const CHROMA_SAMPLE_RATE = 12_000;
export const CHROMA_FRAME_LENGTH = 4096;
export const CHROMA_HOP_LENGTH = 1200;
export const CHROMA_QUIET_SHARE = 0.02;
export const CHROMA_MATCH_SECONDS = 20;
// Music is scored at 22.05 kHz, where its octave bands from 63 Hz to 8 kHz all fit, each band's level in decibels read
// In the pitch classes' own frames, a level more than 60 dB under the game's loudest in that band read as that floor
export const LISTEN_SAMPLE_RATE = 22_050;
export const LISTEN_BAND_CENTRES: number[] = [63, 125, 250, 500, 1000, 2000, 4000, 8000];
// The screen that plays the login's music, which the parity page renders it through
export const LOGIN_MUSIC_SCREEN = "LoginMusic";
// The size the parity page is opened at where nothing it draws is read: the music it renders, the claims on a scene's
// Exports
export const UNDRAWN_PAGE_SIZE = 360;
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
// A note is heard by `notes` in frames of 4096 samples 512 apart at `LISTEN_SAMPLE_RATE`, at its fundamental within a
// Third of a semitone, from 40 ms after its start, past its attack's spread, to 600 ms in or its end. It is supported
// Where the game's level there stands over our render's with it silenced, and each note is judged with a sixth of the
// Notes silenced at once, every sixth by its start, so a chord's notes are never silenced together
export const NOTE_SUPPORT_FRAME_LENGTH = 4096;
export const NOTE_SUPPORT_HOP_LENGTH = 512;
export const CHANNELS = [0, 1, 2] as const;
// A CPU profile's clock is kept in microseconds, a millisecond being this many of them
export const MICROSECONDS_PER_MS = 1000;
export const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;
export const NUMBER_SOURCE: string = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?`;

// The frames a range reads, and the frames left to pass before it, so the GPU has finished the frames encoded before a
// Kind was hidden or shown again and the camera has come to rest after the walk
export const RANGE_FRAMES = 120;
export const SETTLE_FRAMES = 30;
