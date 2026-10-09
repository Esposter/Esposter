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
// The Gaussian blur sigmas, in texels, that a surface detail is split into octave bands by: each band is the energy of the
// Difference between two neighbouring blurs, from the texel itself up to the coarsest sigma
export const SURFACE_DETAIL_BAND_SIGMAS: number[] = [1, 2, 4, 8];
// The texel frequencies the surface detail octaves are drawn at, a cycle per this many texels: one a factor of three
// Coarser than the next, which spreads the octaves across the bands and the variance so their responses are independent
export const SURFACE_OCTAVE_TEXEL_FREQUENCIES: number[] = [0.9, 0.3, 0.1, 0.033, 0.011];
// The statistics one unit amplitude of each octave's noise draws, as the detail's own statistics read them: the four
// Bands finest first, then the variance, per octave in `SURFACE_OCTAVE_TEXEL_FREQUENCIES`' order. Measured by sampling the
// Engine's `mx_noise_float` at each frequency (`computeMxPerlinNoise`), so the amplitudes solve against the energy the
// Render draws rather than a sinusoid's
export const SURFACE_OCTAVE_RESPONSES: number[][] = [
  [0.0529, 0.00115, 0.00013, 0.0000385, 0.0618],
  [0.0162, 0.00896, 0.00235, 0.000251, 0.0605],
  [0.000543, 0.00257, 0.00927, 0.00654, 0.0626],
  [0.0000099, 0.0000654, 0.000742, 0.0048, 0.0534],
  [0.000000419, 0.00000155, 0.0000169, 0.000188, 0.0379],
];
// The user data keys a mesh carries its own surface and fade under, which a material shared by many meshes reads as each is
// Drawn (`setObjectSurface`, `setObjectFade`)
export const OBJECT_SURFACE_KEY = "surface";
export const OBJECT_FADE_KEY = "fade";
// How wide a leaf card's pointed oval is at its middle, a share of the card's half-width (`createLeafShapeNode`), and so
// The share of its card the oval keeps: its half-width falls as one less the square of the height along the card, which
// Keeps two thirds of the width's share
export const LEAF_SHAPE_WIDTH = 0.8;
export const LEAF_SHAPE_KEPT_SHARE: number = (LEAF_SHAPE_WIDTH * 2) / 3;
