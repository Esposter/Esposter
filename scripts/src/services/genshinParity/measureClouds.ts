import type { CloudStatistics } from "#src/models/genshinParity/CloudStatistics";

// A sky's clouds by their statistics rather than their places, which a score comparing pixels cannot read when two
// Skies' clouds are each other's in kind but not in place: how much of the sky they cover, how bright they stand over
// The clear sky behind them, how much their brightness varies inside them, and how sharp their edges are, each edge's
// Mean gradient over the step from the sky to the cloud, so a soft painted edge reads near nothing and a cut-out near
// One. Each mask holds 1 where its pixel counts: the sky's is the sky above the horizon, the clouds' those of it
// Brighter than the clear sky by the cloud's ratio
export const measureClouds = (
  luminance: Float32Array,
  { clouds, sky }: { clouds: Uint8Array; sky: Uint8Array },
  width: number,
  height: number,
): CloudStatistics => {
  let skyCount = 0;
  let cloudCount = 0;
  let cloudSum = 0;
  let cloudSquareSum = 0;
  let clearSum = 0;
  let edgeGradientSum = 0;
  let edgeCount = 0;
  for (let pixel = 0; pixel < width * height; pixel++) {
    if (!sky[pixel]) continue;
    skyCount++;
    const value = luminance[pixel] ?? 0;
    if (!clouds[pixel]) {
      clearSum += value;
      continue;
    }
    cloudCount++;
    cloudSum += value;
    cloudSquareSum += value * value;
    const [column, row] = [pixel % width, Math.floor(pixel / width)];
    if (column === 0 || row === 0 || column === width - 1 || row === height - 1) continue;
    const neighbours = [pixel - 1, pixel + 1, pixel - width, pixel + width];
    // A cloud pixel beside the clear sky stands on its edge
    if (neighbours.every((neighbour) => clouds[neighbour] || !sky[neighbour])) continue;
    edgeGradientSum += Math.hypot(
      ((luminance[pixel + 1] ?? 0) - (luminance[pixel - 1] ?? 0)) / 2,
      ((luminance[pixel + width] ?? 0) - (luminance[pixel - width] ?? 0)) / 2,
    );
    edgeCount++;
  }
  const cloudMean = cloudSum / Math.max(cloudCount, 1);
  const clearMean = clearSum / Math.max(skyCount - cloudCount, 1);
  const step = Math.max(cloudMean - clearMean, Number.EPSILON);
  return {
    contrast: cloudMean / Math.max(clearMean, Number.EPSILON),
    coverage: cloudCount / Math.max(skyCount, 1),
    edgeSharpness: edgeGradientSum / Math.max(edgeCount, 1) / step,
    spread: Math.sqrt(Math.max(cloudSquareSum / Math.max(cloudCount, 1) - cloudMean ** 2, 0)) / step,
  };
};
