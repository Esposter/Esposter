import type { LatheSection } from "#src/models/kits/architecture/LatheSection";

// The stone terrace a building stands on, in metres past its walls and above the ground
export const TERRACE_MARGIN = 1.2;
export const TERRACE_HEIGHT = 0.8;
// The wide bays between a building's columns, in metres
export const BAY_WIDTH = 3;
export const COLUMN_RADIAL_SEGMENTS = 12;
export const COLUMN_CAP_HEIGHT = 0.25;
export const COLUMN_PLINTH_RADIUS = 0.5;
export const COLUMN_SHAFT_BOTTOM_RADIUS = 0.36;
export const COLUMN_SHAFT_TOP_RADIUS = 0.3;
export const COLUMN_CAPITAL_RADIUS = 0.5;
export const BEAM_SIZE = 0.4;
// A lattice panel's sill stands this far above the terrace, its cells this wide, and its bars this thick
export const LATTICE_SILL_HEIGHT = 0.4;
export const LATTICE_CELL = 0.6;
export const LATTICE_BAR_SIZE = 0.06;
// The roof's eaves reach this far past the walls, and its upturned corners lift this far above its middle
export const ROOF_OVERHANG = 1.4;
export const ROOF_EAVE_CURL = 0.9;
// Each tier rises this high, and the tier above it is this fraction of the one below's eave
export const ROOF_TIER_HEIGHT = 2.2;
export const ROOF_TIER_SCALE = 0.7;
// The flat top of a tier is this fraction of its eave, where its ridge ornaments stand at the corners
export const ROOF_RIDGE_SCALE = 0.35;
export const ROOF_RING_COUNT = 6;
export const ROOF_SIDE_SEGMENTS = 6;
export const FINIAL_RADIAL_SEGMENTS = 8;
export const FINIAL_SECTIONS: LatheSection[] = [
  { bottomRadius: 0.2, height: 0.4, topRadius: 0.12 },
  { bottomRadius: 0.12, height: 0.5, topRadius: 0.02 },
];
