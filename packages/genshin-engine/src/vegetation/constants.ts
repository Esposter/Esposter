// An impostor's textures are this many texels along their longer side
export const IMPOSTOR_RESOLUTION = 256;
// A tree hands its mesh to its impostor this many of its heights from the eye, crossing over a band this share of that
// Distance wide. Provisional: measured where the game's own trees change over, off a recording walking away from one
export const IMPOSTOR_SWITCH_HEIGHTS = 10;
export const IMPOSTOR_CROSSFADE_SHARE = 0.1;
// How far a flower's head bends, in metres, for a unit of wind
export const FLOWER_BEND_PER_WIND = 0.12;
// The per-instance attributes a tile's flowers are drawn from: each instance's matrix as its four columns, and its colour
export const FLOWER_MATRIX_ATTRIBUTE_NAMES = [
  "flowerMatrix0",
  "flowerMatrix1",
  "flowerMatrix2",
  "flowerMatrix3",
] as const;
export const FLOWER_COLOR_ATTRIBUTE_NAME = "flowerColor";
// The grass trail is a square of ground this many metres a side round the character, in this many texels a side. The
// Texel is the trail's resolution and the extent its reach. Provisional: neither is measured off a recording of the
// Game's grass parting
export const GRASS_TRAIL_EXTENT = 16;
export const GRASS_TRAIL_TEXELS = 64;
// A texel's side, in metres
export const GRASS_TRAIL_TEXEL_SIZE: number = GRASS_TRAIL_EXTENT / GRASS_TRAIL_TEXELS;
// The stamp a character leaves in the trail, a disc this many metres across its footing, and the seconds a stamp takes
// to fade. Both provisional, like the extent
export const GRASS_TRAIL_STAMP_RADIUS = 0.6;
export const GRASS_TRAIL_FADE_SECONDS = 1.5;
// How far a blade bends at the top, as a share of its height, under a full stamp of the trail
export const GRASS_TRAIL_BEND_SHARE = 0.9;
// The trail fades to nothing between these shares of its half extent, so the texels past its reach never bend a blade
export const GRASS_TRAIL_FADE_START_SHARE = 0.8;
export const GRASS_TRAIL_FADE_END_SHARE = 0.95;
