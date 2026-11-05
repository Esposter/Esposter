import { computeBloomRegion } from "#src/services/genshinParity/passes/computeBloomRegion";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { toLab } from "#src/services/shared/toLab";
import { toXyz } from "#src/services/shared/toXyz";

// The bloom's reading over the reference's brightest pixels (`computeBloomRegion`): the mean CIELab distance from the
// reference of our frame with the bloom drawn, less the same for our frame with it off. Negative where the drawn bloom
// reads closer, which is where the bloom closes; Infinity where the reference shows no white to read
export const computeBloomReading = (
  reference: Buffer,
  bloomedFrame: Buffer,
  unbloomedFrame: Buffer,
  width: number,
  height: number,
): number => {
  const region = computeBloomRegion(reference, width, height);
  let bloomedSum = 0;
  let unbloomedSum = 0;
  let count = 0;
  for (let pixel = 0; pixel < width * height; pixel++) {
    if (!region[pixel]) continue;
    count++;
    const referenceLab = toLab(toXyz(getPixelDisplayColor(reference, pixel)));
    const bloomedLab = toLab(toXyz(getPixelDisplayColor(bloomedFrame, pixel)));
    const unbloomedLab = toLab(toXyz(getPixelDisplayColor(unbloomedFrame, pixel)));
    bloomedSum += Math.hypot(...referenceLab.map((value, axis) => value - (bloomedLab[axis] ?? 0)));
    unbloomedSum += Math.hypot(...referenceLab.map((value, axis) => value - (unbloomedLab[axis] ?? 0)));
  }
  return count === 0 ? Infinity : (bloomedSum - unbloomedSum) / count;
};
