// The family a part target draws at a pixel, or none where no part stands
const readFamily = (part: Float32Array, pixel: number): number =>
  (part[pixel * 4] ?? 0) > 0 ? (part[pixel * 4 + 1] ?? -1) : -1;
// Each family's shape, ours against the exports', from the part, depth and normal targets the witness drew of each at
// One view, four floats a pixel: its outline as the pixels one of the two draws and the other does not over the length
// Of the exports' outline, the pixels the outlines stand apart on average; and where both draw it, the depth's gap as
// A share of the exports' and the normals' angle in degrees, each on average. A family the exports draw no outline of
// Is left out, and one ours does not draw where the exports do has no depth or normal to read, so they stand at
// Infinity
export const compareFamilyTargets = (
  exportsTargets: { depth: Float32Array; normal: Float32Array; part: Float32Array },
  oursTargets: { depth: Float32Array; normal: Float32Array; part: Float32Array },
  width: number,
  familyCount: number,
): { depth: number; family: number; normal: number; outline: number }[] => {
  const pixelCount = exportsTargets.part.length / 4;
  return Array.from({ length: familyCount }, (_family, family) => family).flatMap((family) => {
    const checkIsApart = (neighbour: number): boolean => readFamily(exportsTargets.part, neighbour) !== family;
    let apart = 0;
    let outlineLength = 0;
    let shared = 0;
    let depthGap = 0;
    let normalAngle = 0;
    for (let pixel = 0; pixel < pixelCount; pixel++) {
      const isExports = readFamily(exportsTargets.part, pixel) === family;
      const isOurs = readFamily(oursTargets.part, pixel) === family;
      if (isExports !== isOurs) apart++;
      const column = pixel % width;
      if (
        isExports &&
        ((column > 0 && checkIsApart(pixel - 1)) ||
          (column < width - 1 && checkIsApart(pixel + 1)) ||
          (pixel >= width && checkIsApart(pixel - width)) ||
          (pixel + width < pixelCount && checkIsApart(pixel + width)))
      )
        outlineLength++;
      if (!isExports || !isOurs) continue;
      shared++;
      const exportsDepth = exportsTargets.depth[pixel * 4] ?? 0;
      depthGap += Math.abs((oursTargets.depth[pixel * 4] ?? 0) - exportsDepth) / exportsDepth;
      let cosine = 0;
      for (let axis = 0; axis < 3; axis++)
        cosine += (exportsTargets.normal[pixel * 4 + axis] ?? 0) * (oursTargets.normal[pixel * 4 + axis] ?? 0);
      normalAngle += (Math.acos(Math.min(Math.max(cosine, -1), 1)) * 180) / Math.PI;
    }
    if (outlineLength === 0) return [];
    return [
      {
        depth: shared > 0 ? depthGap / shared : Infinity,
        family,
        normal: shared > 0 ? normalAngle / shared : Infinity,
        outline: apart / outlineLength,
      },
    ];
  });
};
