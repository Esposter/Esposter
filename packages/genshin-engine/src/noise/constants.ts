// How finely a texture's spectrum is held: its frequencies in bands of their radius, evenly by its logarithm from one
// Cycle across the texture's longer side to the corner's frequency, twice an octave over a texture a few hundred
// Texels across, and in sectors of their direction across half a turn, a spectrum standing the same at a frequency and
// Its opposite
export const SPECTRAL_RADIAL_BIN_COUNT = 16;
export const SPECTRAL_ANGULAR_BIN_COUNT = 8;
