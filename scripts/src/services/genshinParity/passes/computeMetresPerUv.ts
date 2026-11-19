// The metres of surface one UV unit spans on a mesh, the median over its triangles of the root of each one's area ratio:
// A triangle's world area over its UV area is the square of the metres a UV unit spans across it, so the root is that
// Scale. A triangle with no UV area says nothing about the scale and is left out. None where no triangle has one
export const computeMetresPerUv = (triangles: readonly { uvArea: number; worldArea: number }[]): number | undefined => {
  const scales = triangles
    .filter(({ uvArea }) => uvArea > 0)
    .map(({ uvArea, worldArea }) => Math.sqrt(worldArea / uvArea))
    .toSorted((firstScale, secondScale) => firstScale - secondScale);
  if (scales.length === 0) return undefined;
  const middle = Math.floor(scales.length / 2);
  return scales.length % 2 === 1 ? scales[middle] : ((scales[middle - 1] ?? 0) + (scales[middle] ?? 0)) / 2;
};
