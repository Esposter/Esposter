// The least a height or a size is divided by, as the game's sky shader guards its own
export const LEAST_DIVISOR = 1e-4;
// The power the sun's visibility is raised to before it scales a stone face's facing, as the game's deferred pass
// Reads its toon ramp
export const STONE_SHADOW_EXPONENT = 0.2;
// The knots the stone's toon ramp is held at, evenly from its dark end to its lit end
export const STONE_RAMP_KNOT_COUNT = 16;
// The terms of the second order spherical harmonics the sky's light on the stone is held in
export const STONE_HARMONIC_COUNT = 9;
// The scene pass's output every stone writes one into and the rest of the scene none, which the haze reads to draw the
// Stone under colours of its own
export const STONE_MASK_OUTPUT = "stoneMask";
// How fast the stone's light that fades with height dims, a share a metre up from the scene's ground, fitted to stand
// In for the reflection pass's clustered probes stepping up the towers: over tens of metres, not off one surface
export const STONE_HEIGHT_FALLOFF = 0.05;
