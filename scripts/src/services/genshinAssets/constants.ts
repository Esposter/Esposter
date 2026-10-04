import { GAME_EXECUTABLE_PATH, PARITY_DIRECTORY } from "#src/services/genshinParity/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

// What the game's own files are exported into: references like every other, kept outside the repository and never
// Shipped. Only the parameters `fit` writes from them, which are ours, enter a package
export const EXTRACTED_DIRECTORY: string = join(PARITY_DIRECTORY, "extracted");
export const ASSET_MAP_NAME = "gi_map";
// The asset map AnimeStudio writes, about a gigabyte of JSON, and the name, type and block of each entry pulled out of
// It as tab separated lines, which a component's search reads in seconds
export const ASSET_MAP_PATH: string = join(EXTRACTED_DIRECTORY, "maps", `${ASSET_MAP_NAME}.json`);
export const ASSET_INDEX_PATH: string = join(EXTRACTED_DIRECTORY, "maps", "index.tsv");
// AnimeStudio's command line (github.com/Escartem/AnimeStudio), unpacked where the user keeps it. It writes its CAB map
// Into a `Maps` folder beside its working directory, so it is run from its own folder
export const ANIMESTUDIO_CLI_PATH: string =
  process.env.GENSHIN_ANIMESTUDIO_CLI ?? join(homedir(), "Downloads", "AnimeStudio", "AnimeStudio.CLI.exe");
// The CAB map `map` builds there: every serialized file's block and the files it points into
export const CAB_MAP_PATH: string = join(dirname(ANIMESTUDIO_CLI_PATH), "Maps", `${ASSET_MAP_NAME}.bin`);
// What a type filter is suffixed with to have AnimeStudio export a type's objects without parsing them: a raw export of
// An object its parser refuses (a shader it misreads) is otherwise dropped
export const ANIMESTUDIO_UNPARSED_SUFFIX = ":Export";
// The block holding the game's deferred passes, `Hidden/Internal-DeferredShading` and `Hidden/DeferredReflections`:
// A scene's stone shader only writes the G-buffer, and these light it, so every component's shaders are read beside
// Them. Found by naming every shader of every block in the asset index from its unparsed raw export
export const DEFERRED_SHADING_BLOCK = "00/00612967.blk";
// The suffix AnimeStudio gives the folder it exports a block into when its assets are grouped by source
export const SOURCE_EXPORT_SUFFIX = ".blk_export";
// The installed game's asset blocks, every one AnimeStudio reads
export const GAME_BLOCKS_DIRECTORY: string = join(
  dirname(GAME_EXECUTABLE_PATH),
  "GenshinImpact_Data",
  "StreamingAssets",
  "AssetBundles",
  "blocks",
);
// The asset types an export writes as files, and the types dumped as JSON to rebuild where each mesh stands and what
// Materials it draws with
export const EXPORTED_ASSET_TYPES = ["Mesh", "Texture2D", "Material"] as const;
export const LAYOUT_ASSET_TYPES = [
  "Transform",
  "GameObject",
  "MeshFilter",
  "MeshRenderer",
  "SkinnedMeshRenderer",
] as const;
// The installed game's Wwise audio packages: its sound banks in `Banks*.pck`, its music's sounds in `Music*.pck`
export const GAME_AUDIO_DIRECTORY: string = join(
  dirname(GAME_EXECUTABLE_PATH),
  "GenshinImpact_Data",
  "StreamingAssets",
  "AudioAssets",
);
export const SOUND_BANK_PACKAGE_PATTERN = "Banks*.pck";
export const MUSIC_PACKAGE_PATTERN = "Music*.pck";
// What the game's music is decoded into, a reference like every other export: each sound as WAV by its id, and each
// One's pitch classes, which a recording is matched against
export const MUSIC_DIRECTORY: string = join(EXTRACTED_DIRECTORY, "music");
// A music fit reads its source's spectrum in Hann windows of this many samples at the transcription's rate, a hop of
// The transcription's own apart, so a note's frames line up with the model's: long enough that a low note's harmonics
// Fall in bins of their own, short enough that an attack is not smeared past the window's half
export const MUSIC_FRAME_LENGTH = 2048;
export const MUSIC_HOP_LENGTH = 256;
// The overtones a voice's timbre is measured to, and the frequency past which nothing is read, short of the codec's cut
// At the transcription's half rate
export const MUSIC_HARMONIC_COUNT = 32;
export const MUSIC_MAX_FREQUENCY = 10_000;
// A partial's leakage through a Hann window's sidelobes falls some fifty decibels under its peak by six bins out, as far
// Under a note as a mix's noise sits, so a band's noise is read only that far from every partial, and from at least two
// Such bins
export const MUSIC_NOISE_CLEAR_BINS = 6;
export const MUSIC_NOISE_MIN_BINS = 2;
// A band is given noise only where the game's sound in it is noise-like: its tonal octaves read a median flatness under
// About 0.06 and its noisy ones over about 0.09
export const MUSIC_NOISE_MIN_FLATNESS = 0.07;
// The Gauss-Newton steps refining the voices' noise from its least-squares solve, which settles within a few
export const MUSIC_NOISE_REFINE_STEPS = 20;
// A harmonic is measured only where every other sounding note's harmonics stand at least this many semitones clear of
// It, and the spectrum's bins at least this many
export const MUSIC_CLEAR_SEMITONES = 0.5;
export const MUSIC_CLEAR_BINS = 2;
// Another note's partial in that span covers a reading only when it is expected at least this share of the reading's
// Amplitude: a smaller one moves the reading by under a decibel, inside every band's distance the listening score charges
export const MUSIC_COVER_SHARE = 0.1;
// A value of an instrument is fitted only from at least this many measurements; a harmonic with fewer is left silent
export const MUSIC_MIN_MEASUREMENTS = 5;
// The registers a piece's notes are split into, each played by one fitted instrument
export const MUSIC_VOICE_COUNT = 3;
// How long after a note's end its fade is read, and the share of a level under which a reading is noise: a fade against
// The note's level, a note's peak against the voice's loudest, an overtone against its fundamental
export const MUSIC_RELEASE_SECONDS = 1;
export const MUSIC_NOISE_SHARE = 0.01;
// A note's times are kept to the millisecond and its other values to the thousandth
export const MUSIC_DECIMALS = 3;
// Vgmstream's command line (github.com/vgmstream/vgmstream), which decodes Wwise's own Vorbis, pinned and checked as
// FFmpeg is, into the scripts package's cache
export const VGMSTREAM_ARCHIVE_URL =
  "https://github.com/vgmstream/vgmstream/releases/download/r2117/vgmstream-win64.zip";
export const VGMSTREAM_ARCHIVE_SHA256 = "6c4a8a3813864fefed081bbd337dbc0ad93bf88e0b92f5db98d7ab258b22dc6c";
export const VGMSTREAM_DIRECTORY: string = join(REPOSITORY_ROOT, "scripts", "node_modules", ".cache", "vgmstream");
// 3Dmigoto's command-line decompiler (github.com/bo3b/3Dmigoto), which writes a compiled DXBC program as HLSL: its last
// Release to ship it on its own, pinned and checked as FFmpeg is, into the scripts package's cache
export const DECOMPILER_ARCHIVE_URL =
  "https://github.com/bo3b/3Dmigoto/releases/download/1.3.16/cmd_Decompiler-1.3.16.zip";
export const DECOMPILER_ARCHIVE_SHA256 = "5e72e067dfcb15c36f106efa74d805055eec5314dc84b8fca8e65d835683a1b2";
export const DECOMPILER_DIRECTORY: string = join(REPOSITORY_ROOT, "scripts", "node_modules", ".cache", "3dmigoto");
// How many programs one run of the decompiler is handed, so their names stay well within Windows' command line
export const DECOMPILER_BATCH_SIZE = 200;
// Where `fit` writes the parameters it fits, as data of the world package's own, which its scenes read
export const WORLD_DATA_DIRECTORY: string = join(REPOSITORY_ROOT, "packages", "genshin-world", "src", "data");
// A tower is fitted in two metre bands, a band merged into the one below while its radius holds within 3% of it, and
// Its numbers kept to the centimetre
export const TOWER_BAND_HEIGHT = 2;
export const TOWER_RADIUS_TOLERANCE = 0.03;
// A tower's mesh at one level of detail, the tower being its name without the level
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const TOWER_MESH_REGEX: RegExp = /^(?<part>LoginScene_Build\d+_\d+)_Lod(?<level>\d)$/u;
// A tower's surface is unrolled on a grid of half a unit of its mesh, five centimetres as the scene scales it; a run of
// Its height keeps one tone while each channel of its shade holds within this of the one below; a face standing a unit
// In from the lathe's radius is a shallow recess (the fluting, a moulding's groove) and four units a deep one (a window,
// An arch), and a loop round fewer than this many cells is dropped as a speck of its paint
export const TOWER_FACADE_CELL_SIZE = 0.5;
export const TOWER_FACADE_SHADE_TOLERANCE = 0.04;
export const TOWER_FACADE_SHALLOW_RECESS = 1;
export const TOWER_FACADE_DEEP_RECESS = 4;
export const TOWER_FACADE_MIN_CELLS = 40;
// Paint on a tower's face stands apart from its band where it is this share darker or lighter
export const TOWER_FACADE_PAINT_CONTRAST = 0.12;
export const FITTED_DECIMALS = 2;
// A rotation's components are kept to the ten-thousandth, finer than a centimetre over the scene's farthest part
export const ROTATION_DECIMALS = 10_000;
// A walkway's outline is traced on a five-centimetre grid and kept within two centimetres of it, so pieces laid along
// Its diagonal cracks meet with no gap to see their sides through
export const WALKWAY_CELL_SIZE = 0.05;
export const WALKWAY_OUTLINE_TOLERANCE = 0.02;
// A bridge's or a pillar's hull is carved on a grid of a unit of its own mesh, a tenth of a metre as the scene scales it
export const HULL_CELL_SIZE = 1;
// How far a ratio's cross-ratio in the fitted data may stray from its reference's: a pixel off at each end of widths
// About two hundred pixels across moves it by about a hundredth
export const ARRANGEMENT_CROSS_RATIO_TOLERANCE = 0.01;
// The path ID a root's parent is written as
export const ROOT_PARENT_ID = "0";
// A cloud atlas holds its painted clouds in two columns of four rows, each traced on a grid of four texels and kept
// Within one grid cell of it; a texel is the cloud where its alpha passes half, and its lit crown where its red (the
// Light the painter put on it) does
export const CLOUD_ATLAS_COLUMNS = 2;
export const CLOUD_ATLAS_ROWS = 4;
export const CLOUD_TRACE_TEXELS = 4;
export const CLOUD_TRACE_TOLERANCE = 1;
export const CLOUD_COVERAGE_THRESHOLD = 0.5;
export const CLOUD_LIT_THRESHOLD = 0.5;
