import type { LatheSection } from "genshin-engine";

// Liyue's palette in sRGB, the hues the game's Liyue reads as: ochre and grey rock, jade-green water, golden ginkgo and
// autumn maples, and the red lacquer and gold of its architecture
export const LIYUE_OCHRE_ROCK_COLOR = 0xb8925a;
export const LIYUE_GREY_ROCK_COLOR = 0x8f8a80;
export const LIYUE_JADE_WATER_COLOR = 0x5fae97;
export const LIYUE_GINKGO_COLOR = 0xe2b43c;
export const LIYUE_MAPLE_COLOR = 0xb4502e;
export const LIYUE_LACQUER_COLOR = 0xa8262a;
export const LIYUE_ROOF_COLOR = 0xd8a33a;
export const LIYUE_STONE_COLOR = 0xcfc6b2;
// The stone terrace a building stands on, in metres past its walls and above the ground
export const LIYUE_TERRACE_MARGIN = 1.2;
export const LIYUE_TERRACE_HEIGHT = 0.8;
// The wide bays between a building's columns, in metres
export const LIYUE_BAY_WIDTH = 3;
export const LIYUE_COLUMN_RADIAL_SEGMENTS = 12;
export const LIYUE_COLUMN_CAP_HEIGHT = 0.25;
export const LIYUE_COLUMN_PLINTH_RADIUS = 0.5;
export const LIYUE_COLUMN_SHAFT_BOTTOM_RADIUS = 0.36;
export const LIYUE_COLUMN_SHAFT_TOP_RADIUS = 0.3;
export const LIYUE_COLUMN_CAPITAL_RADIUS = 0.5;
export const LIYUE_BEAM_SIZE = 0.4;
// A lattice panel's sill stands this far above the terrace, its cells this wide, and its bars this thick
export const LIYUE_LATTICE_SILL_HEIGHT = 0.4;
export const LIYUE_LATTICE_CELL = 0.6;
export const LIYUE_LATTICE_BAR_SIZE = 0.06;
// The roof's eaves reach this far past the walls, and its upturned corners lift this far above its middle
export const LIYUE_ROOF_OVERHANG = 1.4;
export const LIYUE_ROOF_EAVE_CURL = 0.9;
// Each tier rises this high, and the tier above it is this fraction of the one below's eave
export const LIYUE_ROOF_TIER_HEIGHT = 2.2;
export const LIYUE_ROOF_TIER_SCALE = 0.7;
// The flat top of a tier is this fraction of its eave, where its ridge ornaments stand at the corners
export const LIYUE_ROOF_RIDGE_SCALE = 0.35;
export const LIYUE_ROOF_RING_COUNT = 6;
export const LIYUE_ROOF_SIDE_SEGMENTS = 6;
export const LIYUE_FINIAL_RADIAL_SEGMENTS = 8;
export const LIYUE_FINIAL_SECTIONS: LatheSection[] = [
  { bottomRadius: 0.2, height: 0.4, topRadius: 0.12 },
  { bottomRadius: 0.12, height: 0.5, topRadius: 0.02 },
];
