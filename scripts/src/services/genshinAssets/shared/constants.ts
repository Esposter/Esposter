import type { SampledInstrument } from "#src/models/genshinAssets/shared/SampledInstrument";
import type { SoundStart } from "#src/models/genshinAssets/sound/SoundStart";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { SampleLibrary } from "#src/models/genshinAssets/shared/SampleLibrary";
import { GAME_EXECUTABLE_PATH, PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

// What the game's own files are exported into: references like every other, kept outside the repository and never
// Shipped. Only the parameters `fit` writes from them, which are ours, enter a package
export const EXTRACTED_DIRECTORY: string = join(PARITY_DIRECTORY, "extracted");
// The layout a component's witness is written as, beside its exports in the component's root
export const WITNESS_LAYOUT_FILE_NAME = "witness.json";
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
// A serialized pointer to an object: its file's index into the external references, then its path ID
export const SERIALIZED_POINTER_BYTES = 12;
// The open world's terrain tiles, a kilometre a side from the world's origin, the column of each the world's x over the
// Side and the row its z, named for both (BigWorldTerrain_1_-2.bin, `parseTerrainTileName`), and the texture that
// Draws a tile from afar
export const TERRAIN_TILE_SIZE = 1024;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const TERRAIN_TILE_REGEX: RegExp = /_(?<column>-?\d+)_(?<row>-?\d+)\.bin$/u;
export const TERRAIN_BASE_MAP_SUFFIX = "_BaseMap";
// How far round a region's centre its ground is fitted and its terrain read, in metres: the valley the screen's views see
export const GROUND_RADIUS = 1000;
// The texture slot a material's albedo is sampled from, which the witness reads as a colour
export const MAIN_TEXTURE_SLOT = "_MainTex";
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
// The copies the game's hotfix downloads put under `Persistent`, which the game reads over the StreamingAssets copy
export const GAME_PERSISTENT_BLOCKS_DIRECTORY: string = join(
  dirname(GAME_EXECUTABLE_PATH),
  "GenshinImpact_Data",
  "Persistent",
  "AssetBundles",
  "blocks",
);
// The asset types an export writes as files, and the types dumped as JSON to rebuild where each mesh stands and what
// Materials it draws with
export const EXPORTED_ASSET_TYPES: readonly AssetType[] = [AssetType.Mesh, AssetType.Texture2D, AssetType.Material];
export const LAYOUT_ASSET_TYPES: readonly AssetType[] = [
  AssetType.Transform,
  AssetType.GameObject,
  AssetType.MeshFilter,
  AssetType.MeshRenderer,
  AssetType.SkinnedMeshRenderer,
];
// The installed game's Wwise audio packages: its sound banks in `Banks*.pck`, its music's sounds in `Music*.pck`
export const GAME_AUDIO_DIRECTORY: string = join(
  dirname(GAME_EXECUTABLE_PATH),
  "GenshinImpact_Data",
  "StreamingAssets",
  "AudioAssets",
);
export const SOUND_BANK_PACKAGE_PATTERN = "Banks*.pck";
export const MUSIC_PACKAGE_PATTERN = "Music*.pck";
// The package the game loads before anything else, whose banks hold the login's own sounds
export const MINIMUM_PACKAGE_NAME = "Minimum.pck";
// What the game's music is decoded into, a reference like every other export: each sound as WAV by its id, and each
// One's pitch classes, which a recording is matched against
export const MUSIC_DIRECTORY: string = join(EXTRACTED_DIRECTORY, "music");
// What the game's sound effects are decoded into, each as WAV by its id, kept for the next match or fit
export const SOUND_DIRECTORY: string = join(EXTRACTED_DIRECTORY, "sounds");
// A sound effect's levels are read at the sounds' own rate in Hann windows of 2048 samples, 25 milliseconds apart
export const SOUND_SAMPLE_RATE = 48_000;
export const SOUND_FRAME_LENGTH = 2048;
export const SOUND_HOP_LENGTH = 1200;
// A music fit reads its source's spectrum in Hann windows of this many samples at the transcription's rate, a hop of
// The transcription's own apart, so a note's frames line up with the model's: long enough that a low note's harmonics
// Fall in bins of their own, short enough that an attack is not smeared past the window's half
export const MUSIC_FRAME_LENGTH = 2048;
export const MUSIC_HOP_LENGTH = 256;
// The overtones a voice's timbre is measured to, and the frequency past which nothing is read, short of the codec's cut
// At the transcription's half rate
export const MUSIC_HARMONIC_COUNT = 32;
export const MUSIC_MAX_FREQUENCY = 10_000;
// A partial's leakage through a Hann window's sidelobes falls some fifty decibels under its peak by six bins out, as
// Far under a note as a mix's noise sits, so a band's noise is read only that far from every partial, and from at least
// Two such bins
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
// Amplitude: a smaller one moves the reading by under a decibel, inside every band's distance the listening score
// Charges
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
// Where the sample libraries' files are cached, each at its pinned commit: only the mappings and the samples a piece's
// Notes play are fetched, not the libraries' gigabytes
export const SAMPLES_DIRECTORY: string = join(REPOSITORY_ROOT, "scripts", "node_modules", ".cache", "samples");
// The combinations of one instrument a voice whose least-squares powers are refined against the score's own distance,
// And the halvings of a refinement's step, from doubling a voice's power down to about a twentieth of a decibel
export const SAMPLED_VOICE_REFINED_COUNT = 64;
export const SAMPLED_VOICE_REFINE_STEPS = 6;
// The best combinations a fit's report prints
export const SAMPLED_VOICE_REPORTED_COUNT = 8;
// A recording's sound starts where it first reaches a tenth of its loudest, twenty decibels down
export const SAMPLE_ONSET_SHARE = 0.1;
// The most frames either way a solo render's pitch classes are read against its notes', about a fifth of a second
export const SAMPLED_VOICE_MAX_LAG = 4;
// A shipped recording's bit rate as Opus, one channel's half of the 128 kbit/s Xiph gives as about transparent for
// Stereo music
export const MUSIC_RECORDING_BITRATE = "64k";
// A recording runs to tens of megabytes, past the bound a script's ordinary request is given
export const SAMPLE_DOWNLOAD_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 2 }).total("milliseconds");
// What a voice's instrument is chosen from: each library's sustained and plucked orchestral instruments and its pianos,
// Harps and tuned percussion, past which an orchestral theme reaches for nothing
export const SAMPLED_INSTRUMENTS: SampledInstrument[] = [
  ...[
    "BassoonSus",
    "CelloEnsPizz",
    "CelloEnsSpic",
    "CelloEnsSusVib",
    "ClarinetSus",
    "ContrabassPizz",
    "ContrabassSusVB",
    "FHornSus",
    "FluteSusNV",
    "FluteSusVib",
    "Glockenspiel",
    "Harp",
    "Marimba",
    "OboeSusVib",
    "SViolinVib",
    "Timpani",
    "TromboneSus",
    "TrumpetSus",
    "TubaSus",
    "TubularBells",
    "UprightPiano",
    "VSUpright1",
    "ViolaEnsPizz",
    "ViolaEnsSusVib",
    "ViolinEnsPizz",
    "ViolinEnsSpic",
    "ViolinEnsSusVib",
    "Xylophone",
  ].map((name) => ({ library: SampleLibrary.Vsco2, mapping: `${name}.sfz` })),
  ...[
    "Chordophones/Composite Chordophones/Concert Harp",
    "Chordophones/Composite Chordophones/Folk Harp",
    "Chordophones/Zithers/Dan Tranh - Normal",
    "Chordophones/Zithers/Grand Piano, Kawai",
    "Chordophones/Zithers/Grand Piano, Steinway B",
    "Chordophones/Zithers/Upright Piano, Knight",
    "Chordophones/Zithers/Upright Piano, Yamaha",
    "Idiophones/Struck Idiophones/Glockenspiel",
    "Idiophones/Struck Idiophones/Hand Chimes",
    "Idiophones/Struck Idiophones/Vibraphone - Soft Mallets",
  ].map((name) => ({ library: SampleLibrary.Vcsl, mapping: `${name}.sfz` })),
  { library: SampleLibrary.DsmolkenDoubleBass, mapping: "d_smolken_rubner_bass_arco.sfz" },
  { library: SampleLibrary.DsmolkenDoubleBass, mapping: "d_smolken_rubner_bass_pizz.sfz" },
  { library: SampleLibrary.KaroryferBigcatCello, mapping: "Programs/vc_arco_sus_map.sfz" },
  { library: SampleLibrary.KaroryferBigcatCello, mapping: "Programs/vc_pizz_basic.sfz" },
  { library: SampleLibrary.OsirisPiano, mapping: "Programs/01-natural.sfz" },
];
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
// The game's own area table in the community's dump, each area's id and the text id of its name, and the field a scene
// Point files the area it stands in under, as the dump obfuscates it: Windrise's statue's holds 201, which the table
// Names Windrise
export const WORLD_AREAS_PATH: string = join(EXCEL_DIRECTORY, "WorldAreaConfigData.json");
export const SCENE_POINT_AREA_FIELD = "HDMEDFBJMPK";
// Where `genshin:parity instruments` writes the recordings the login's music plays, rewritten whole, which the world
// Package serves from its `LOGIN_MUSIC_RECORDING_DIRECTORY`
export const LOGIN_MUSIC_RECORDING_DIRECTORY: string = join(WORLD_DATA_DIRECTORY, "login", "recordings");
// A tower is fitted in two metre bands, a band merged into the one below while its radius holds within 3% of it, and
// Its numbers kept to the centimetre
export const TOWER_BAND_HEIGHT = 2;
export const TOWER_RADIUS_TOLERANCE = 0.03;
// A tower's mesh at one level of detail, the tower being its name without the level
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const TOWER_MESH_REGEX: RegExp = /^(?<part>LoginScene_Build\d+_\d+)_Lod(?<level>\d)$/u;
// The Statue of The Seven is fitted in a tenth of a metre's bands, a band merged into the one below while its radii hold
// Within 2% of it at every angle, its radii read at `STATUE_ANGLE_COUNT` angles, each of its meshes (its figure, its base
// And its levels) fitted as a part of its own
export const STATUE_BAND_HEIGHT = 0.1;
export const STATUE_RADIUS_TOLERANCE = 0.02;
export const STATUE_ANGLE_COUNT = 16;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const STATUE_MESH_REGEX: RegExp = /^Stages_MdGoddess/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const STATUE_FIGURE_MESH_REGEX: RegExp = /^Stages_MdGoddess_Lite/u;
// The great oak as its export's Lod1 meshes: its canopy's clusters grouped from the leaf's card centres by a seeded
// K-means, the same export always clustering the same way, and its trunk's radius at each station read off the bark
// Within a slab of a station's height and within the trunk's reach of its axis
export const OAK_LEAF_MESH = "Stages_Unique_CyTree01_Leaf_Lod1";
export const OAK_BARK_MESH = "Stages_Unique_CyTree01_Bark_Lod1";
export const OAK_CLUSTER_COUNT = 40;
export const OAK_CLUSTER_SEED = 12345;
export const OAK_TRUNK_HEIGHTS: number[] = [0, 2, 4, 6, 8, 10, 12];
export const OAK_TRUNK_SLAB_HALF_HEIGHT = 1;
export const OAK_TRUNK_REACH = 8;
// A tower's surface is unrolled on a grid of an eighth of a unit of its mesh, about a centimetre as the scene scales
// It, fine enough that its carving's edges land within a pixel of the exports' where the login sees the towers nearest,
// And its paint read again on half units, as fine as its loops are traced; a run of its height keeps one tone while
// Each channel of its shade holds within this of the one below; a face standing a unit in from the lathe's radius is a
// Shallow recess (the fluting, a moulding's groove) and four units a deep one (a window, an arch), and a loop or a run
// Of carving over less than this many square units is dropped as a speck
export const TOWER_FACADE_CELL_SIZE = 0.125;
export const TOWER_FACADE_PAINT_CELL_SIZE = 0.5;
export const TOWER_FACADE_SHADE_TOLERANCE = 0.04;
export const TOWER_FACADE_SHALLOW_RECESS = 1;
export const TOWER_FACADE_DEEP_RECESS = 4;
export const TOWER_FACADE_MIN_AREA = 10;
// Paint on a tower's face stands apart from its band where it is this share darker or lighter
export const TOWER_FACADE_PAINT_CONTRAST = 0.12;
// How far a tower's wall profile may stray from the radii its rows stand at, in units of its mesh, once simplified
export const TOWER_PROFILE_TOLERANCE = 0.25;
export const FITTED_DECIMALS = 2;
// Unity turns by Euler degrees about z, then x, then y
export const UNITY_EULER_ORDER = "YXZ";
// A rotation's components are kept to the ten-thousandth, finer than a centimetre over the scene's farthest part
export const ROTATION_DECIMALS = 10_000;
// A scale is kept to five decimals, not to the centimetre: a tower's 0.1028 kept as 0.1 stood its crown metres low
export const SCALE_DECIMALS = 5;
// A walkway's outline is traced on a five-centimetre grid and kept within two centimetres of it, so pieces laid along
// Its diagonal cracks meet with no gap to see their sides through
export const WALKWAY_CELL_SIZE = 0.05;
export const WALKWAY_OUTLINE_TOLERANCE = 0.02;
// What stands this many metres or more over a walkway piece's stone is raised (a curb, a lane's border), kept where it
// Covers this many of the centimetre cells it is read on, and its height kept to the millimetre, a curb being only a
// Centimetre or three high
export const WALKWAY_RAISED_HEIGHT = 0.005;
export const WALKWAY_RAISED_MIN_CELLS = 50;
export const WALKWAY_RAISED_DECIMALS = 3;
// A bridge's or a pillar's hull is carved on a grid of a unit of its own mesh, a tenth of a metre as the scene scales
// It
export const HULL_CELL_SIZE = 1;
// How far a ratio's cross-ratio in the fitted data may stray from its reference's: a pixel off at each end of widths
// About two hundred pixels across moves it by about a hundredth
export const ARRANGEMENT_CROSS_RATIO_TOLERANCE = 0.01;
// The region data file the open world's landmarks are written to, the one Windrise's landmarks and capitals are fitted into
export const WINDRISE_REGION_FILE = "regions/mondstadt.json";
// The path ID a root's parent is written as
export const ROOT_PARENT_ID = "0";
// How far a world position may stand from the origin and still count as at it, in metres: a placement a float off zero is
// Collapsed there all the same
export const ORIGIN_TOLERANCE_METRES = 0.001;
// A cloud atlas holds its painted clouds in two columns of four rows, each traced on a grid of four texels and kept
// Within one grid cell of it; a texel is the cloud where its alpha passes half, and its lit crown where its red (the
// Light the painter put on it) does
export const CLOUD_ATLAS_COLUMNS = 2;
export const CLOUD_ATLAS_ROWS = 4;
export const CLOUD_TRACE_TEXELS = 4;
export const CLOUD_TRACE_TOLERANCE = 1;
export const CLOUD_COVERAGE_THRESHOLD = 0.5;
export const CLOUD_LIT_THRESHOLD = 0.5;
// A gilded texel's red runs past its blue by this many times, where the stone's are about equal
export const GILDING_RED_BLUE_RATIO = 1.8;
// The login's door: its object and the mesh it draws share this name
export const LOGIN_DOOR_MESH = "LoginScene_Door01_Vo";
// Every piece the walkway is laid from: its paving, its borders and its wings
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const WALKWAY_MESH_REGEX: RegExp = /^LoginScene_Bridge01_\d+_Vo$/u;
// The two sounds the door plays, each found in the package the game loads first by `genshin:assets sounds` against the
// Door recording's burst: a rumble, then a broadband rush 75 milliseconds later, each laid at its mix volume
// (`readGameSoundEffect`)
export const LOGIN_DOOR_SOUNDS: readonly SoundStart[] = [
  { id: 402_626_033, offsetSeconds: 0 },
  { id: 73_142_117, offsetSeconds: 0.075 },
];
