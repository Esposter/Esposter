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
export const OUTLINE_WIDTH_SCALE = 0.41425;
export const DESATURATION_WEIGHTS: readonly [number, number, number] = [0.0397, 0.458, 0.0061];
// Provisional: the page's values for the light area and the band width are not fitted, so these stand in until they are
export const DEFAULT_LIGHT_AREA = 1;
export const DEFAULT_RAMP_WIDTH = 0.5;
// The lightmap of a material that names none: red 0, so no metal and no specular, green the neutral middle, and alpha 0
// So region one
export const FLAT_LIGHT_MAP: Readonly<[number, number, number, number]> = [0, NEUTRAL_LIGHT_MAP_GREEN, 0, 0];
