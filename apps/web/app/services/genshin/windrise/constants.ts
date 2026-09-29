import type { GradeOptions, GrassRing, RampOptions, SkyKeyframe, TerrainOptions, TreeOptions } from "genshin-engine";

import { Color, Vector2 } from "three";

// The ground's quadtree: half-metre cells under the eye in tiles of sixteen metres, six levels out to a root tile of
// Half a kilometre drawn a kilometre and a half away, well past where the fog closes. The finest range clears twice
// A finest tile's diagonal, which CDLOD needs for a level's tiles to morph before their neighbours change level
export const WINDRISE_TERRAIN_OPTIONS: TerrainOptions = {
  cellsPerSide: 32,
  finestRange: 48,
  finestTileSize: 16,
  levelCount: 6,
  maxHeight: 60,
  minHeight: -10,
  morphShare: 0.3,
};
export const WINDRISE_SEED = 0;
// The knoll the oak stands on, and the hills that close the valley around it
export const KNOLL_HEIGHT = 9;
export const KNOLL_RADIUS = 40;
export const RIM_HEIGHT = 38;
export const RIM_START_RADIUS = 110;
export const RIM_END_RADIUS = 230;
export const DETAIL_HEIGHT = 1.4;
export const DETAIL_SCALE = 45;
// The valley opens to the east, where its hills fall away to a lake's shore: how much of the rim the opening takes,
// And the lake's centre, radius and the depth its bowl sinks below the ground around it
export const EAST_OPENING = 0.85;
export const LAKE_CENTER_X = 300;
export const LAKE_CENTER_Z = 40;
export const LAKE_RADIUS = 150;
export const LAKE_DEPTH = 14;
// The lake's surface, a few metres under the valley floor, so the water fills only the lake's bowl
export const WATER_LEVEL = -3;
// Clear shallows over the pale bed turning a deep blue in the middle, as Mondstadt's lakes read, and a green haze
// Under the surface
export const WATER_SHALLOW_COLOR = 0x5fd3c8;
export const WATER_DEEP_COLOR = 0x1d5fa8;
export const WATER_DEEP_DEPTH = 6;
export const WATER_FOAM_DEPTH = 0.6;
export const WATER_CAUSTIC_STRENGTH = 0.35;
export const UNDERWATER_FOG_COLOR = 0x1f7a86;
export const UNDERWATER_FOG_DENSITY = 0.08;
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
// How far the sun and the god rays' sun stand from what they look at
export const SUN_DISTANCE = 120;
export const RIM_STRENGTH = 0.55;
// Colours as the palette sees them, in sRGB
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
// The reference screenshots' hour, three in the afternoon, which a load starts at
export const WINDRISE_START_MINUTES = 900;
// How far the sun's path leans south of overhead, in radians: its noon stands about sixty-four degrees high
export const SUN_TILT = 0.45;
// A fair-weather sky of scattered cumulus
export const CLOUD_COVERAGE = 0.42;
// Mondstadt's wind: a steady breeze out of the west with gusts rolling across the meadows every half minute
export const WIND_DIRECTION = new Vector2(0.94, 0.34).normalize();
export const WIND_STRENGTH = 0.3;
export const WIND_GUST_STRENGTH = 0.45;
export const WIND_GUST_WIDTH = 30;
export const WIND_GUST_SPEED = 7;
// Windrise's grass: knee-high blades in a dense ring under the eye, and taller, sparser blades out to where the
// Ground's own green carries the field
export const GRASS_BLADE_HEIGHT = 0.5;
export const GRASS_BLADE_WIDTH = 0.08;
export const NEAR_GRASS_RING: GrassRing = {
  cellsPerSide: 256,
  fadeEnd: 38,
  fadeStart: 28,
  innerRadius: 0,
  scale: 1,
  spacing: 0.3,
};
export const MIDDLE_GRASS_RING: GrassRing = {
  cellsPerSide: 192,
  fadeEnd: 76,
  fadeStart: 56,
  innerRadius: 30,
  scale: 1.7,
  spacing: 0.8,
};
// Windrise's day: a deep blue night lit by the moon, an apricot dawn, a high clear afternoon, a gold and violet dusk.
// The light is near nothing at six and eighteen, where the moon hands the sky to the sun and back
export const WINDRISE_SKY_KEYFRAMES: readonly SkyKeyframe[] = [
  {
    cloudLitColor: new Color(0x3c5288),
    cloudShadeColor: new Color(0x1d2a4c),
    hemisphereGroundColor: new Color(0x1a2a2a),
    hemisphereIntensity: 0.7,
    hemisphereSkyColor: new Color(0x2c4478),
    horizonColor: new Color(0x1f3868),
    lightColor: new Color(0x8fa8ff),
    lightIntensity: 0.45,
    minutes: 0,
    starIntensity: 1,
    zenithColor: new Color(0x0b1a3a),
  },
  {
    cloudLitColor: new Color(0x6a6a98),
    cloudShadeColor: new Color(0x2e3460),
    hemisphereGroundColor: new Color(0x22302a),
    hemisphereIntensity: 0.65,
    hemisphereSkyColor: new Color(0x384e82),
    horizonColor: new Color(0x5a5a8a),
    lightColor: new Color(0x8fa8ff),
    lightIntensity: 0.3,
    minutes: 300,
    starIntensity: 0.6,
    zenithColor: new Color(0x1d2d5e),
  },
  {
    cloudLitColor: new Color(0xffc8a8),
    cloudShadeColor: new Color(0x8a7aa0),
    hemisphereGroundColor: new Color(0x4a5a3a),
    hemisphereIntensity: 0.8,
    hemisphereSkyColor: new Color(0x7a8cbc),
    horizonColor: new Color(0xf2a98a),
    lightColor: new Color(0xffb080),
    lightIntensity: 0.05,
    minutes: 360,
    starIntensity: 0.1,
    zenithColor: new Color(0x4a6aa8),
  },
  {
    cloudLitColor: new Color(0xffe4cc),
    cloudShadeColor: new Color(0xa898b8),
    hemisphereGroundColor: new Color(0x6a7a44),
    hemisphereIntensity: 1,
    hemisphereSkyColor: new Color(0x9ab8e0),
    horizonColor: new Color(0xffcfa0),
    lightColor: new Color(0xffc890),
    lightIntensity: 1.4,
    minutes: 420,
    starIntensity: 0,
    zenithColor: new Color(0x6a9ed8),
  },
  {
    cloudLitColor: new Color(0xffffff),
    cloudShadeColor: new Color(0xb8c8e2),
    hemisphereGroundColor: new Color(0x5d7f3a),
    hemisphereIntensity: 1.3,
    hemisphereSkyColor: new Color(0x8ec8ff),
    horizonColor: new Color(0xcfe8ff),
    lightColor: new Color(0xfff6e8),
    lightIntensity: 2.8,
    minutes: 720,
    starIntensity: 0,
    zenithColor: new Color(0x3f8fe6),
  },
  {
    cloudLitColor: new Color(0xffffff),
    cloudShadeColor: new Color(0xbccae2),
    hemisphereGroundColor: new Color(0x5d7f3a),
    hemisphereIntensity: 1.3,
    hemisphereSkyColor: new Color(0x8ec8ff),
    horizonColor: new Color(0xcfe8ff),
    lightColor: new Color(0xfff4e0),
    lightIntensity: 2.6,
    minutes: 900,
    starIntensity: 0,
    zenithColor: new Color(0x4c98ec),
  },
  {
    cloudLitColor: new Color(0xffd0a8),
    cloudShadeColor: new Color(0x8a78a8),
    hemisphereGroundColor: new Color(0x5a6038),
    hemisphereIntensity: 1.05,
    hemisphereSkyColor: new Color(0x9a94c8),
    horizonColor: new Color(0xffba78),
    lightColor: new Color(0xffae66),
    lightIntensity: 1.5,
    minutes: 1020,
    starIntensity: 0,
    zenithColor: new Color(0x5a78c0),
  },
  {
    cloudLitColor: new Color(0xe89aa8),
    cloudShadeColor: new Color(0x5a4a88),
    hemisphereGroundColor: new Color(0x3a4032),
    hemisphereIntensity: 0.8,
    hemisphereSkyColor: new Color(0x6a64a8),
    horizonColor: new Color(0xd98aa0),
    lightColor: new Color(0xff8a70),
    lightIntensity: 0.05,
    minutes: 1080,
    starIntensity: 0.2,
    zenithColor: new Color(0x3a3c86),
  },
  {
    cloudLitColor: new Color(0x4a5890),
    cloudShadeColor: new Color(0x222c52),
    hemisphereGroundColor: new Color(0x1e2c2c),
    hemisphereIntensity: 0.7,
    hemisphereSkyColor: new Color(0x34467a),
    horizonColor: new Color(0x3a3f78),
    lightColor: new Color(0x8fa8ff),
    lightIntensity: 0.35,
    minutes: 1140,
    starIntensity: 0.8,
    zenithColor: new Color(0x16224c),
  },
];
