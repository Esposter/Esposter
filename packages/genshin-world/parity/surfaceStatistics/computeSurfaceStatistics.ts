import type { SurfaceStatisticsInput } from "#parity/surfaceStatistics/SurfaceStatisticsInput";

import { CombineMode } from "#parity/surfaceStatistics/CombineMode";
import { SURFACE_STATISTICS_PARTIAL_COUNT } from "#parity/surfaceStatistics/constants";
import { createRecorder } from "#parity/surfaceStatistics/createRecorder";
import { createStorageBuffer } from "#parity/surfaceStatistics/createStorageBuffer";
import { destroyBuffers } from "#parity/surfaceStatistics/destroyBuffers";
import { getBlurWeights } from "#parity/surfaceStatistics/getBlurWeights";
import { getSlotSum } from "#parity/surfaceStatistics/getSlotSum";
import { getSurfaceStatisticsDevice } from "#parity/surfaceStatistics/getSurfaceStatisticsDevice";
import { submitAndReadBuffers } from "#parity/surfaceStatistics/submitAndReadBuffers";
import { uploadStorageBuffer } from "#parity/surfaceStatistics/uploadStorageBuffer";
import { takeOne } from "@esposter/shared";

// The reductions a surface reads in its first submit, each a slot of the partial sums
enum Slot {
  Count = 0,
  Sum = 1,
  FirstBand = 2,
}

// A surface's statistics over the pixels its mask holds, computed on the GPU: the variance of its luminance, then the
// Mean square of each octave band's detail, finest first, each band the difference between a level and the next
// Coarser one. The same definition as the CPU reference (`computeStatisticalStructure`), with the mask as a 0 or 1 a pixel
export const computeSurfaceStatistics = async ({
  height,
  mask,
  sigmas,
  values,
  width,
}: SurfaceStatisticsInput): Promise<number[]> => {
  const device = await getSurfaceStatisticsDevice();
  const count = width * height;
  const maskValues = Float32Array.from(mask, (bit) => (bit ? 1 : 0));
  const valueBuffer = uploadStorageBuffer(device, values);
  const maskBuffer = uploadStorageBuffer(device, maskValues);
  const weightedBuffer = createStorageBuffer(device, count);
  const temporaryBuffer = createStorageBuffer(device, count);
  const blurredValuesBuffer = createStorageBuffer(device, count);
  const blurredMaskBuffer = createStorageBuffer(device, count);
  const termBuffer = createStorageBuffer(device, count);
  const levelBuffers = sigmas.map(() => createStorageBuffer(device, count));
  const partialBuffer = createStorageBuffer(
    device,
    (Slot.FirstBand + sigmas.length) * SURFACE_STATISTICS_PARTIAL_COUNT,
  );
  const weightBuffers = sigmas.map((sigma) => uploadStorageBuffer(device, getBlurWeights(sigma)));
  const storageBuffers = [
    valueBuffer,
    maskBuffer,
    weightedBuffer,
    temporaryBuffer,
    blurredValuesBuffer,
    blurredMaskBuffer,
    termBuffer,
    partialBuffer,
    ...levelBuffers,
    ...weightBuffers,
  ];

  const encoder = device.createCommandEncoder();
  const recorder = createRecorder(device, encoder);
  recorder.combine(valueBuffer, maskBuffer, maskBuffer, weightedBuffer, count, CombineMode.Product);
  recorder.reduce(maskBuffer, partialBuffer, count, Slot.Count);
  recorder.reduce(weightedBuffer, partialBuffer, count, Slot.Sum);
  for (const [level, sigma] of sigmas.entries()) {
    const radius = Math.ceil(3 * sigma);
    const weights = takeOne(weightBuffers, level);
    const levelBuffer = takeOne(levelBuffers, level);
    recorder.blur(weightedBuffer, blurredValuesBuffer, temporaryBuffer, weights, width, height, radius);
    recorder.blur(maskBuffer, blurredMaskBuffer, temporaryBuffer, weights, width, height, radius);
    recorder.combine(blurredValuesBuffer, blurredMaskBuffer, maskBuffer, levelBuffer, count, CombineMode.Ratio);
  }
  // Each band is the mask's squared difference between a level and the next coarser one, the first level being the values
  for (const band of sigmas.keys()) {
    const finer = band === 0 ? valueBuffer : takeOne(levelBuffers, band - 1);
    const coarser = takeOne(levelBuffers, band);
    recorder.combine(finer, coarser, maskBuffer, termBuffer, count, CombineMode.SquaredDifference);
    recorder.reduce(termBuffer, partialBuffer, count, Slot.FirstBand + band);
  }
  const [firstSlots = new Float32Array()] = await submitAndReadBuffers(device, encoder, [
    { buffer: partialBuffer, length: (Slot.FirstBand + sigmas.length) * SURFACE_STATISTICS_PARTIAL_COUNT },
  ]);
  destroyBuffers(recorder.parameterBuffers);
  const maskCount = getSlotSum(firstSlots, Slot.Count);
  if (maskCount === 0) {
    destroyBuffers(storageBuffers);
    return [];
  }
  const mean = getSlotSum(firstSlots, Slot.Sum) / maskCount;
  // The variance is the mask's squared deviation from the mean, which the first submit's sums must come before
  const varianceEncoder = device.createCommandEncoder();
  const varianceRecorder = createRecorder(device, varianceEncoder);
  varianceRecorder.combine(valueBuffer, maskBuffer, maskBuffer, termBuffer, count, CombineMode.SquaredDeviation, mean);
  varianceRecorder.reduce(termBuffer, partialBuffer, count, Slot.Count);
  const [varianceSlots = new Float32Array()] = await submitAndReadBuffers(device, varianceEncoder, [
    { buffer: partialBuffer, length: SURFACE_STATISTICS_PARTIAL_COUNT },
  ]);
  destroyBuffers(varianceRecorder.parameterBuffers);
  const bandEnergies = sigmas.map((_sigma, band) => getSlotSum(firstSlots, Slot.FirstBand + band) / maskCount);
  destroyBuffers(storageBuffers);
  return [getSlotSum(varianceSlots, 0) / maskCount, ...bandEnergies];
};
