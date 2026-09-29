import type { GradeOptions, RampOptions, TreeOptions } from "genshin-engine";

// The valley's side and grid, in metres and vertices: a few hundred metres around the oak, fine enough that the knoll
// Reads round
export const WINDRISE_SIZE = 480;
export const WINDRISE_RESOLUTION = 193;
export const WINDRISE_SEED = 0;
// The knoll the oak stands on, and the hills that close the valley around it
export const KNOLL_HEIGHT = 9;
export const KNOLL_RADIUS = 40;
export const RIM_HEIGHT = 38;
export const RIM_START_RADIUS = 110;
export const RIM_END_RADIUS = 230;
export const DETAIL_HEIGHT = 1.4;
export const DETAIL_SCALE = 45;
// The great oak, far larger than any tree around it
export const WINDRISE_OAK_OPTIONS: TreeOptions = {
  branchLength: 11,
  cardSize: 1.3,
  cardsPerCluster: 220,
  clusterRadius: 5.5,
  mainBranchCount: 7,
  seed: WINDRISE_SEED,
  trunkHeight: 12,
  trunkRadius: 1.9,
};
// The statue stands in the oak's shade, a few metres from its trunk
export const STATUE_OFFSET_X = 7;
export const STATUE_OFFSET_Z = 5;
// An early afternoon sun, high in the south-west
export const SUN_DIRECTION = [0.45, 0.78, 0.43] as const;
export const SUN_DISTANCE = 120;
export const SUN_INTENSITY = 2.6;
export const HEMISPHERE_INTENSITY = 1.3;
export const RIM_STRENGTH = 0.55;
// Colours as the palette sees them, in sRGB
export const SKY_COLOR = 0x8ec8ff;
export const HORIZON_COLOR = 0xcfe8ff;
export const GROUND_BOUNCE_COLOR = 0x5d7f3a;
export const GRASS_LIGHT_COLOR = 0x9ed05a;
export const GRASS_DARK_COLOR = 0x5f9e3b;
export const ROCK_COLOR = 0x9c9486;
export const BARK_COLOR = 0x6b4a33;
export const LEAF_COLOR = 0x6fae3f;
export const STONE_COLOR = 0xd9d2c1;
// Slopes steeper than this show rock through the grass
export const ROCK_SLOPE = 0.3;
// The ramp every material shades through: a narrow step, a little past the grazing angle
export const WINDRISE_RAMP_OPTIONS: RampOptions = { resolution: 64, softness: 0.08, terminator: 0.52 };
// A haze thickest on the valley floor and gone a few hundred metres up, starting past the knoll so the oak stays clear
export const FOG_DENSITY = 0.0024;
export const FOG_HEIGHT_FALLOFF = 0.02;
export const FOG_START_DISTANCE = 60;
// How far from the eye the sun's last cascade reaches: past the valley's rim, so the hills shadow what they face
export const SHADOW_MAX_FAR = 320;
// The god rays' one shadow map, spanning the valley around the oak
export const GODRAYS_SHADOW_MAP_SIZE = 1024;
export const GODRAYS_HALF_EXTENT = 160;
// Windrise's afternoon grade: a touch of contrast and colour, cool shade and warm light, as the game's meadows read
export const WINDRISE_GRADE_OPTIONS: GradeOptions = {
  contrast: 1.06,
  highlightTint: [0.03, 0.015, -0.015],
  saturation: 1.12,
  shadowTint: [-0.01, 0, 0.04],
  size: 32,
};
