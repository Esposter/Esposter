import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { toPercent } from "#src/services/genshinParity/reference/toPercent";
import { InvalidOperationError, Operation } from "@esposter/shared";
import sharp from "sharp";

// The mean absolute difference, in percent of full scale, between a cut and a reference over a region both hold, each
// Colour channel counted
export const measureMeanDifference = async (
  cutPath: string,
  referencePath: string,
  region: ImageRegion,
): Promise<number> => {
  const extract = { height: region.height, left: region.x, top: region.y, width: region.width };
  const [cut, reference] = await Promise.all([
    sharp(cutPath).extract(extract).removeAlpha().raw().toBuffer(),
    sharp(referencePath).extract(extract).removeAlpha().raw().toBuffer(),
  ]);
  if (cut.length !== reference.length)
    throw new InvalidOperationError(
      Operation.Read,
      referencePath,
      `${reference.length} samples over the region, not the cut's ${cut.length}`,
    );
  let sum = 0;
  for (let index = 0; index < cut.length; index++) sum += Math.abs((cut[index] ?? 0) - (reference[index] ?? 0));
  return toPercent(sum, cut.length);
};
