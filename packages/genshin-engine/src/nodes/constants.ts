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
// The height in metres over the scene's ground the stone's light stops darkening at (`computeStoneDarkening`): past
// It the towers' crowns hold the light they reach there, which darkened on up stood them darker than the game's
export const STONE_DARKENING_TOP = 20;
// How far a wet surface darkens at full wetness, the share of its colour it keeps
export const WET_DARKENING = 0.35;
// The lobe the sun's glint on a wet surface is drawn with, and how strongly it shows at full wetness
export const WET_SHEEN_POWER = 32;
export const WET_SHEEN_STRENGTH = 0.25;
