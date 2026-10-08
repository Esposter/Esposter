import type { LatheSection } from "genshin-engine";

// Fontaine's palette as the proposal names it, in sRGB: turquoise water, white and cream stone, blue slate roofs, gold
// trim and green lawns under a hazy blue sky, with pink and purple in Erinnyes Forest and grey in Morte. The hex values
// are a first reading of those names, to be checked against the reference screenshots
export const FONTAINE_WATER_COLOR = 0x3ec9c0;
export const FONTAINE_STONE_COLOR = 0xf1e6cf;
export const FONTAINE_WHITE_STONE_COLOR = 0xf7f4ec;
export const FONTAINE_SLATE_COLOR = 0x3f5a7a;
export const FONTAINE_GOLD_COLOR = 0xd6a94a;
export const FONTAINE_IRON_COLOR = 0x2e333d;
export const FONTAINE_LAWN_COLOR = 0x86c25a;
export const FONTAINE_SKY_COLOR = 0x9ec8ea;
export const ERINNYES_PINK_COLOR = 0xd98fb8;
export const ERINNYES_PURPLE_COLOR = 0x8a62a8;
export const MORTE_GREY_COLOR = 0x8f9196;
// Fontaine's building, in metres: a stone ground floor of arched openings, cream ashlar storeys above it, and a mansard
// roof of two slopes, the steep lower one meeting the shallow upper one at its break
export const FONTAINE_GROUND_FLOOR_HEIGHT = 4.5;
export const FONTAINE_STOREY_HEIGHT = 3.6;
export const FONTAINE_CORNICE_HEIGHT = 0.35;
export const FONTAINE_CORNICE_OVERHANG = 0.25;
export const FONTAINE_BALCONY_DEPTH = 1.2;
export const FONTAINE_BALCONY_INSET = 0.3;
export const FONTAINE_BALCONY_HEIGHT = 1.2;
export const FONTAINE_BALCONY_SLAB_HEIGHT = 0.2;
export const FONTAINE_RAIL_HEIGHT = 0.9;
export const FONTAINE_RAIL_THICKNESS = 0.06;
export const FONTAINE_FLOWER_BOX_DEPTH = 0.35;
export const FONTAINE_FLOWER_BOX_HEIGHT = 0.35;
export const FONTAINE_FLOWER_BOX_INSET = 0.3;
// An arch is a half ring whose radius is this share of its bay's width, its spring line at the given height
export const FONTAINE_ARCH_RADIUS_RATIO = 0.3;
export const FONTAINE_ARCH_SPRING_HEIGHT = 2.6;
export const FONTAINE_ARCH_TUBE_RADIUS = 0.2;
export const FONTAINE_ARCH_RADIAL_SEGMENTS = 8;
export const FONTAINE_ARCH_TUBULAR_SEGMENTS = 24;
export const FONTAINE_AWNING_CLEARANCE = 0.1;
export const FONTAINE_AWNING_DEPTH = 1.2;
export const FONTAINE_AWNING_HEIGHT = 0.15;
export const FONTAINE_AWNING_INSET = 0.2;
// Each slope's top is this share of its base's width and depth, so the upper one is set in from the lower's break
export const FONTAINE_MANSARD_LOWER_HEIGHT = 2.4;
export const FONTAINE_MANSARD_LOWER_TAPER = 0.9;
export const FONTAINE_MANSARD_UPPER_HEIGHT = 1.2;
export const FONTAINE_MANSARD_UPPER_TAPER = 0.8;
// The circumradius of a four-sided cylinder whose sides are one metre from its centre, the scale a frustum is built at
export const FONTAINE_SQUARE_CIRCUMRADIUS: number = Math.SQRT2;
// How far up the lower slope a dormer's base sits, as a share of that slope's height
export const FONTAINE_DORMER_SLOPE_POSITION = 0.3;
export const FONTAINE_DORMER_WIDTH_RATIO = 0.4;
export const FONTAINE_DORMER_HEIGHT = 1.2;
export const FONTAINE_DORMER_INSET = 0.5;
export const FONTAINE_DORMER_PROJECTION = 0.9;
export const FONTAINE_LAMP_OFFSET = 1.5;
export const FONTAINE_LAMP_RADIAL_SEGMENTS = 8;
export const FONTAINE_LAMP_POST_SECTIONS: LatheSection[] = [
  { bottomRadius: 0.25, height: 0.4, topRadius: 0.18 },
  { bottomRadius: 0.1, height: 3.2, topRadius: 0.08 },
];
export const FONTAINE_LANTERN_SIZE = 0.4;
