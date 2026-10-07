import { computeNormalAngle } from "#src/services/genshinParity/passes/computeNormalAngle";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";

// Each family's shape, ours against the exports', from the part, depth and normal targets the witness drew of each at
// One view, four floats a pixel: its outline as the pixels one of the two draws and the other does not over the length
// Of the exports' outline, the pixels the outlines stand apart on average; and where both draw it, the depth's gap as
// A share of the exports' and the normals' angle in degrees, each on average, with each exported part's sum of that
// Angle and its pixels, so a family's loss is named by the parts it lies on. A family the exports draw no outline of
// Is left out, and one ours does not draw where the exports do has no depth or normal to read, so they stand at
// Infinity
export const compareFamilyTargets = (
  exportsTargets: { depth: Float32Array; normal: Float32Array; part: Float32Array },
  oursTargets: { depth: Float32Array; normal: Float32Array; part: Float32Array },
  width: number,
  familyCount: number,
): {
  depth: number;
  family: number;
  normal: number;
  normalByPart: { angle: number; part: number; pixelCount: number }[];
  outline: number;
}[] => {
  const pixelCount = exportsTargets.part.length / 4;
  return Array.from({ length: familyCount }, (_family, family) => family).flatMap((family) => {
    const checkIsApart = (neighbour: number): boolean => readTargetFamily(exportsTargets.part, neighbour) !== family;
    let apart = 0;
    let outlineLength = 0;
    let shared = 0;
    let depthGap = 0;
    let normalAngle = 0;
    const normalByPart = new Map<number, { angle: number; part: number; pixelCount: number }>();
    for (let pixel = 0; pixel < pixelCount; pixel++) {
      const isExports = readTargetFamily(exportsTargets.part, pixel) === family;
      const isOurs = readTargetFamily(oursTargets.part, pixel) === family;
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
      const angle = computeNormalAngle(exportsTargets.normal, oursTargets.normal, pixel);
      normalAngle += angle;
      const part = exportsTargets.part[pixel * 4] ?? 0;
      const partNormal = normalByPart.get(part) ?? { angle: 0, part, pixelCount: 0 };
      partNormal.angle += angle;
      partNormal.pixelCount++;
      normalByPart.set(part, partNormal);
    }
    if (outlineLength === 0) return [];
    return [
      {
        depth: shared > 0 ? depthGap / shared : Infinity,
        family,
        normal: shared > 0 ? normalAngle / shared : Infinity,
        normalByPart: [...normalByPart.values()],
        outline: apart / outlineLength,
      },
    ];
  });
};
