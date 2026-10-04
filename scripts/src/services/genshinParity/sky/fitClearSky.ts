import { solveLinearSystem } from "#src/services/genshinParity/shared/solveLinearSystem";

// The polynomial's degree across and up the frame: a sky's gradient bends up the frame toward its horizon and across it
// Toward its sun, smoothly, and a cubic holds both while no cloud's few hundred pixels fit into it
const DEGREE = 3;
// The share of the fit's error weighted where a pixel stands over it rather than under it, short of the cloud's ratio:
// Clouds only ever stand over their sky, so a fit weighing them a tenth as much as the sky under it settles on the
// Clear tail, and a pixel past the ratio, a cloud, is not weighed at all
const OVER_WEIGHT = 0.1;
const ITERATION_COUNT = 12;
// The terms of a cubic in a pixel's place, each axis scaled to [-1, 1]
const computeTerms = (x: number, y: number): number[] => {
  const terms: number[] = [];
  for (let yPower = 0; yPower <= DEGREE; yPower++)
    for (let xPower = 0; xPower + yPower <= DEGREE; xPower++) terms.push(x ** xPower * y ** yPower);
  return terms;
};
// A sky's clear luminance at every pixel, as the logarithm a smooth surface fits to its masked pixels' logarithms by
// Asymmetric least squares: each pass weighs a pixel over the surface a tenth as much as one under it and a cloud, past
// The ratio, not at all, so the surface sinks through the clouds to the clear sky between them however the sky's
// Gradient runs across the frame, where a percentile a band of rows at a time takes the bright side of a band toward
// The sun for cloud
export const fitClearSky = (
  luminance: Float32Array,
  mask: Uint8Array,
  width: number,
  height: number,
  cloudRatio: number,
): Float32Array => {
  const logRatio = Math.log(cloudRatio);
  const pixels: { logLuminance: number; terms: number[] }[] = [];
  for (let pixel = 0; pixel < width * height; pixel++)
    if (mask[pixel])
      pixels.push({
        logLuminance: Math.log(Math.max(luminance[pixel] ?? 0, Number.EPSILON)),
        terms: computeTerms(((pixel % width) / width) * 2 - 1, (Math.floor(pixel / width) / height) * 2 - 1),
      });
  const termCount = computeTerms(0, 0).length;
  let coefficients = Array.from({ length: termCount }, () => 0);
  let weights = pixels.map(() => 1);
  for (let iteration = 0; iteration < ITERATION_COUNT; iteration++) {
    const normal = Array.from({ length: termCount }, () => Array.from({ length: termCount }, () => 0));
    const vector = Array.from({ length: termCount }, () => 0);
    for (const [index, { logLuminance, terms }] of pixels.entries()) {
      const weight = weights[index] ?? 0;
      for (let row = 0; row < termCount; row++) {
        const rowTerm = (terms[row] ?? 0) * weight;
        vector[row] = (vector[row] ?? 0) + rowTerm * logLuminance;
        const normalRow = normal[row] ?? [];
        for (let column = 0; column < termCount; column++)
          normalRow[column] = (normalRow[column] ?? 0) + rowTerm * (terms[column] ?? 0);
      }
    }
    const solved = solveLinearSystem(normal, vector) ?? coefficients;
    coefficients = solved;
    weights = pixels.map(({ logLuminance, terms }) => {
      const over = logLuminance - terms.reduce((sum, term, index) => sum + term * (solved[index] ?? 0), 0);
      if (over > logRatio) return 0;
      else return over > 0 ? OVER_WEIGHT : 1;
    });
  }
  return Float32Array.from({ length: width * height }, (_value, pixel) =>
    computeTerms(((pixel % width) / width) * 2 - 1, (Math.floor(pixel / width) / height) * 2 - 1).reduce(
      (sum, term, index) => sum + term * (coefficients[index] ?? 0),
      0,
    ),
  );
};
