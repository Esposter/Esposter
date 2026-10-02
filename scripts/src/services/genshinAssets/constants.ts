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
