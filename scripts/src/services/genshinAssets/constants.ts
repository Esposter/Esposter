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
// Where `fit` writes the parameters it fits, as data of the world package's own, which its scenes read
export const WORLD_DATA_DIRECTORY: string = join(REPOSITORY_ROOT, "packages", "genshin-world", "src", "data");
// A tower is fitted in two metre bands, a band merged into the one below while its radius holds within 3% of it, and
// Its numbers kept to the centimetre
export const TOWER_BAND_HEIGHT = 2;
export const TOWER_RADIUS_TOLERANCE = 0.03;
export const FITTED_DECIMALS = 2;
// A walkway's outline is traced on a quarter-metre grid and kept within ten centimetres of it
export const WALKWAY_CELL_SIZE = 0.25;
export const WALKWAY_OUTLINE_TOLERANCE = 0.1;
// A bridge's or a pillar's silhouette is traced on a half-metre grid and kept within a quarter metre of it
export const SILHOUETTE_CELL_SIZE = 0.5;
export const SILHOUETTE_TOLERANCE = 0.25;
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
