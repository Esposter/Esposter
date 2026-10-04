// The second order spherical harmonics of a world normal, unnormalized, since a light's solve absorbs each term's
// Constant into its colour: the constant, the three linear terms and the five quadratic ones. Written into `harmonics`
// From its start, as `StoneLightingModel` evaluates them in its shader
export const computeStoneHarmonics = ([x = 0, y = 0, z = 0]: readonly number[], harmonics: number[]): void => {
  harmonics[0] = 1;
  harmonics[1] = x;
  harmonics[2] = y;
  harmonics[3] = z;
  harmonics[4] = x * y;
  harmonics[5] = y * z;
  harmonics[6] = x * z;
  harmonics[7] = x * x - z * z;
  harmonics[8] = 3 * y * y - 1;
};
