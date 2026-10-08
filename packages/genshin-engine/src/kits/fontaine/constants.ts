// Fontaine's building, in metres: a stone ground floor of arched openings, cream ashlar storeys above it, and a mansard
// roof of two slopes, the steep lower one meeting the shallow upper one at its break
export const GROUND_FLOOR_HEIGHT = 4.5;
export const STOREY_HEIGHT = 3.6;
export const CORNICE_HEIGHT = 0.35;
export const CORNICE_OVERHANG = 0.25;
export const BALCONY_DEPTH = 1.2;
export const BALCONY_INSET = 0.3;
export const BALCONY_HEIGHT = 1.2;
export const BALCONY_SLAB_HEIGHT = 0.2;
export const RAIL_HEIGHT = 0.9;
export const RAIL_THICKNESS = 0.06;
export const FLOWER_BOX_DEPTH = 0.35;
export const FLOWER_BOX_HEIGHT = 0.35;
export const FLOWER_BOX_INSET = 0.3;
// An arch is a half ring whose radius is this share of its bay's width, its spring line at the given height
export const ARCH_RADIUS_RATIO = 0.3;
export const ARCH_SPRING_HEIGHT = 2.6;
export const ARCH_TUBE_RADIUS = 0.2;
export const ARCH_RADIAL_SEGMENTS = 8;
export const ARCH_TUBULAR_SEGMENTS = 24;
export const AWNING_CLEARANCE = 0.1;
export const AWNING_DEPTH = 1.2;
export const AWNING_HEIGHT = 0.15;
export const AWNING_INSET = 0.2;
// Each slope's top is this share of its base's width and depth, so the upper one is set in from the lower's break
export const MANSARD_LOWER_HEIGHT = 2.4;
export const MANSARD_LOWER_TAPER = 0.9;
export const MANSARD_UPPER_HEIGHT = 1.2;
export const MANSARD_UPPER_TAPER = 0.8;
// The circumradius of a four-sided cylinder whose sides are one metre from its centre, the scale a frustum is built at
export const SQUARE_CIRCUMRADIUS = Math.SQRT2;
// How far up the lower slope a dormer's base sits, as a share of that slope's height
export const DORMER_SLOPE_POSITION = 0.3;
export const DORMER_WIDTH_RATIO = 0.4;
export const DORMER_HEIGHT = 1.2;
export const DORMER_INSET = 0.5;
export const DORMER_PROJECTION = 0.9;
export const LAMP_OFFSET = 1.5;
export const LAMP_RADIAL_SEGMENTS = 8;
export const LAMP_POST_SECTIONS = [
  { bottomRadius: 0.25, height: 0.4, topRadius: 0.18 },
  { bottomRadius: 0.1, height: 3.2, topRadius: 0.08 },
];
export const LANTERN_SIZE = 0.4;
