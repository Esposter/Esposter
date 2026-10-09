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
