// The least a height or a size is divided by, as the game's sky shader guards its own
export const LEAST_DIVISOR = 1e-4;
// The power the sun's visibility is raised to before it scales a stone face's facing, as the game's deferred pass
// Reads its toon ramp
export const STONE_SHADOW_EXPONENT = 0.2;
// The knots the stone's toon ramp is held at, evenly from its dark end to its lit end
export const STONE_RAMP_KNOT_COUNT = 16;
// The terms of the second order spherical harmonics the sky's light on the stone is held in
export const STONE_HARMONIC_COUNT = 9;
