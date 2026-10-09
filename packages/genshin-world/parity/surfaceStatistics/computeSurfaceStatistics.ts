import type { SurfaceStatisticsInput } from "#parity/surfaceStatistics/SurfaceStatisticsInput";

import {
  SURFACE_STATISTICS_PARAMETERS_BINDING,
  SURFACE_STATISTICS_PARAMETERS_BYTES,
  SURFACE_STATISTICS_PARTIAL_COUNT,
  SURFACE_STATISTICS_TILE_SIZE,
  SURFACE_STATISTICS_WORKGROUP_SIZE,
} from "#parity/surfaceStatistics/constants";
import { getBlurWeights } from "#parity/surfaceStatistics/getBlurWeights";
import { getSurfaceStatisticsDevice } from "#parity/surfaceStatistics/getSurfaceStatisticsDevice";
import { getSurfaceStatisticsPipelines } from "#parity/surfaceStatistics/getSurfaceStatisticsPipelines";

// The term modes the combine pass reads, as the shader's numbers
enum CombineMode {
  Product = 0,
  Ratio = 1,
  SquaredDifference = 2,
  SquaredDeviation = 3,
}
// The reductions a surface reads in its first submit, each a slot of the partial sums
enum Slot {
  Count = 0,
  Sum = 1,
  FirstBand = 2,
}
// The uniform's fields, in the order the shader declares them
interface Parameters {
  count: number;
  direction: number;
  height: number;
  mean: number;
  mode: number;
  outputOffset: number;
  radius: number;
  width: number;
}

const createStorageBuffer = (device: GPUDevice, length: number): GPUBuffer =>
  device.createBuffer({
    size: Math.max(length * Float32Array.BYTES_PER_ELEMENT, Float32Array.BYTES_PER_ELEMENT),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  });
const uploadStorageBuffer = (device: GPUDevice, values: Float32Array): GPUBuffer => {
  const buffer = createStorageBuffer(device, values.length);
  device.queue.writeBuffer(buffer, 0, values);
  return buffer;
};
const createParameterBuffer = (device: GPUDevice, parameters: Parameters): GPUBuffer => {
  const buffer = device.createBuffer({
    size: SURFACE_STATISTICS_PARAMETERS_BYTES,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const view = new DataView(new ArrayBuffer(SURFACE_STATISTICS_PARAMETERS_BYTES));
  view.setUint32(0, parameters.count, true);
  view.setUint32(4, parameters.width, true);
  view.setUint32(8, parameters.height, true);
  view.setUint32(12, parameters.radius, true);
  view.setUint32(16, parameters.mode, true);
  view.setUint32(20, parameters.direction, true);
  view.setUint32(24, parameters.outputOffset, true);
  view.setFloat32(28, parameters.mean, true);
  device.queue.writeBuffer(buffer, 0, view);
  return buffer;
};

// Every pass a surface's statistics take, recorded onto one encoder, each with its own uniform so no write waits on a pass
const createRecorder = (device: GPUDevice, encoder: GPUCommandEncoder) => {
  const { blur, combine, reduce } = getSurfaceStatisticsPipelines(device);
  // Each uniform is released once its submit is made, which the device holds until the passes that read it finish
  const parameterBuffers: GPUBuffer[] = [];
  const dispatch = (
    pipeline: GPUComputePipeline,
    bindings: [number, GPUBuffer][],
    parameters: Parameters,
    workgroups: [number, number],
  ): void => {
    const parameterBuffer = createParameterBuffer(device, parameters);
    parameterBuffers.push(parameterBuffer);
    const bindGroup = device.createBindGroup({
      entries: [
        ...bindings.map(([binding, buffer]) => ({ binding, resource: { buffer } })),
        { binding: SURFACE_STATISTICS_PARAMETERS_BINDING, resource: { buffer: parameterBuffer } },
      ],
      layout: pipeline.getBindGroupLayout(0),
    });
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(workgroups[0], workgroups[1]);
    pass.end();
  };
  return {
    // A Gaussian blur of a buffer, one axis then the other, through the temporary buffer
    blur: (
      source: GPUBuffer,
      destination: GPUBuffer,
      temporary: GPUBuffer,
      weights: GPUBuffer,
      width: number,
      height: number,
      radius: number,
    ): void => {
      const workgroups: [number, number] = [
        Math.ceil(width / SURFACE_STATISTICS_TILE_SIZE),
        Math.ceil(height / SURFACE_STATISTICS_TILE_SIZE),
      ];
      const parameters = {
        count: width * height,
        direction: 0,
        height,
        mean: 0,
        mode: 0,
        outputOffset: 0,
        radius,
        width,
      };
      dispatch(
        blur,
        [
          [0, source],
          [1, temporary],
          [2, weights],
        ],
        parameters,
        workgroups,
      );
      dispatch(
        blur,
        [
          [0, temporary],
          [1, destination],
          [2, weights],
        ],
        { ...parameters, direction: 1 },
        workgroups,
      );
    },
    combine: (
      first: GPUBuffer,
      second: GPUBuffer,
      mask: GPUBuffer,
      output: GPUBuffer,
      count: number,
      mode: CombineMode,
      mean: number,
    ): void =>
      dispatch(
        combine,
        [
          [3, first],
          [4, second],
          [5, mask],
          [6, output],
        ],
        { count, direction: 0, height: 0, mean, mode, outputOffset: 0, radius: 0, width: 0 },
        [Math.ceil(count / SURFACE_STATISTICS_WORKGROUP_SIZE), 1],
      ),
    parameterBuffers,
    // A sum over the buffer's first `count` elements, its partial for each workgroup at the offset given
    reduce: (input: GPUBuffer, partials: GPUBuffer, count: number, slot: number): void =>
      dispatch(
        reduce,
        [
          [7, input],
          [8, partials],
        ],
        {
          count,
          direction: 0,
          height: 0,
          mean: 0,
          mode: 0,
          outputOffset: slot * SURFACE_STATISTICS_PARTIAL_COUNT,
          radius: 0,
          width: 0,
        },
        [SURFACE_STATISTICS_PARTIAL_COUNT, 1],
      ),
  };
};

const destroyBuffers = (buffers: GPUBuffer[]): void => {
  for (const buffer of buffers) buffer.destroy();
};
// Submits a recorded encoder, then reads the partial sums back as the host adds them
const submitAndReadPartials = async (
  device: GPUDevice,
  encoder: GPUCommandEncoder,
  partials: GPUBuffer,
  slotCount: number,
): Promise<Float32Array> => {
  const byteLength = slotCount * SURFACE_STATISTICS_PARTIAL_COUNT * Float32Array.BYTES_PER_ELEMENT;
  const staging = device.createBuffer({ size: byteLength, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  encoder.copyBufferToBuffer(partials, 0, staging, 0, byteLength);
  device.queue.submit([encoder.finish()]);
  await staging.mapAsync(GPUMapMode.READ);
  const partialSums = new Float32Array(staging.getMappedRange().slice(0));
  staging.unmap();
  staging.destroy();
  return partialSums;
};
// The sum of each slot's partials, added up in double precision
const getSlotSum = (partialSums: Float32Array, slot: number): number => {
  let total = 0;
  for (let index = 0; index < SURFACE_STATISTICS_PARTIAL_COUNT; index++)
    total += partialSums[slot * SURFACE_STATISTICS_PARTIAL_COUNT + index] ?? 0;
  return total;
};

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
  recorder.combine(valueBuffer, maskBuffer, maskBuffer, weightedBuffer, count, CombineMode.Product, 0);
  recorder.reduce(maskBuffer, partialBuffer, count, Slot.Count);
  recorder.reduce(weightedBuffer, partialBuffer, count, Slot.Sum);
  sigmas.forEach((sigma, level) => {
    const radius = Math.ceil(3 * sigma);
    const weights = weightBuffers[level];
    const levelBuffer = levelBuffers[level];
    if (!weights || !levelBuffer) return;
    recorder.blur(weightedBuffer, blurredValuesBuffer, temporaryBuffer, weights, width, height, radius);
    recorder.blur(maskBuffer, blurredMaskBuffer, temporaryBuffer, weights, width, height, radius);
    recorder.combine(blurredValuesBuffer, blurredMaskBuffer, maskBuffer, levelBuffer, count, CombineMode.Ratio, 0);
  });
  // Each band is the mask's squared difference between a level and the next coarser one, the first level being the values
  sigmas.forEach((_sigma, band) => {
    const finer = band === 0 ? valueBuffer : levelBuffers[band - 1];
    const coarser = levelBuffers[band];
    if (!finer || !coarser) return;
    recorder.combine(finer, coarser, maskBuffer, termBuffer, count, CombineMode.SquaredDifference, 0);
    recorder.reduce(termBuffer, partialBuffer, count, Slot.FirstBand + band);
  });
  const firstSlots = await submitAndReadPartials(device, encoder, partialBuffer, Slot.FirstBand + sigmas.length);
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
  const varianceSlots = await submitAndReadPartials(device, varianceEncoder, partialBuffer, 1);
  destroyBuffers(varianceRecorder.parameterBuffers);
  const bandEnergies = sigmas.map((_sigma, band) => getSlotSum(firstSlots, Slot.FirstBand + band) / maskCount);
  destroyBuffers(storageBuffers);
  return [getSlotSum(varianceSlots, 0) / maskCount, ...bandEnergies];
};
