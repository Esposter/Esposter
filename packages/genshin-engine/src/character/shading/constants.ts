// The game's shader constants as the shading page reads them. Each is written once here, and the pure equations and the
// TSL nodes both take them from this module, so no number is kept in two places
export const REGION_FLOORS = { five: 0.6, four: 0.2, three: 0.4, two: 0.8 } as const;
export const RAMP_ROW_BASE = 0.05;
export const COOL_RAMP_ROW_BASE = 0.55;
export const RAMP_ROW_STEP = 0.1;
export const NEUTRAL_LIGHT_MAP_GREEN = 0.5;
// The main texture's alpha above which its emission is drawn, where the material draws its emission from that alpha
export const EMISSION_ALPHA_FLOOR = 0.01;
export const TOON_LOW = 0.05;
export const TOON_HIGH = 0.95;
export const MINIMUM_RAMP_WIDTH_VERTEX = 0.01;
export const MINIMUM_OUTLINE_KNOT_SPAN = 0.001;
export const OUTLINE_PROJECTION_SCALE = 2.414;
// The game's outline width is its "_OutlineWidth" times this, as its vertex program reads the width
export const OUTLINE_WIDTH_SCALE = 0.41425;
// The share of the main texture an outline is drawn toward, by its region's intensity
export const OUTLINE_MAIN_TEXTURE_SHARE = 0.2;
export const DESATURATION_WEIGHTS: readonly [number, number, number] = [0.0397, 0.458, 0.0061];
// The sun term is the half Lambert the body's program takes of the normal and the light, its scale just under a half
export const HALF_LAMBERT_SCALE = 0.4975;
export const HALF_LAMBERT_OFFSET = 0.5;
// A pack's toon is drawn for MMD's lookup, which reads it down its whole column as the normal turns from the light to
// Away from it. Under the flat lightmap the threshold runs from its value facing away to its value facing the light,
// So the light area is the latter and the band spans the whole run: the column is then MMD's one half plus half the
// Cosine, exactly
export const DEFAULT_LIGHT_AREA: number = (NEUTRAL_LIGHT_MAP_GREEN + HALF_LAMBERT_OFFSET + HALF_LAMBERT_SCALE) / 2;
export const DEFAULT_RAMP_WIDTH: number = HALF_LAMBERT_SCALE / DEFAULT_LIGHT_AREA;
// The face threshold's bounds, a face lit straight on at the minimum and one turned fully from the light at the maximum
export const MINIMUM_FACE_THRESHOLD = 1e-4;
export const MAXIMUM_FACE_THRESHOLD = 0.9999;
// The window's floor stays below this, so its top is always above it and the division never closes on zero
export const MAXIMUM_WINDOW_FLOOR = 0.9989;
// The lightmap of a material that names none: red 0, so no metal and no specular, green the neutral middle, and alpha 0
// So region one
export const FLAT_LIGHT_MAP: Readonly<[number, number, number, number]> = [0, NEUTRAL_LIGHT_MAP_GREEN, 0, 0];
