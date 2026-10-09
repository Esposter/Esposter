import type { CombineMode } from "#parity/surfaceStatistics/CombineMode";
import type { SurfaceStatisticsParameters } from "#parity/surfaceStatistics/SurfaceStatisticsParameters";

import {
  SURFACE_STATISTICS_PARAMETERS_BINDING,
  SURFACE_STATISTICS_PARTIAL_COUNT,
  SURFACE_STATISTICS_TILE_SIZE,
  SURFACE_STATISTICS_WORKGROUP_SIZE,
} from "#parity/surfaceStatistics/constants";
import { createParameterBuffer } from "#parity/surfaceStatistics/createParameterBuffer";
import { getSurfaceStatisticsPipelines } from "#parity/surfaceStatistics/getSurfaceStatisticsPipelines";

// The uniform's fields a pass does not read are left at zero
const getParameters = (overrides: Partial<SurfaceStatisticsParameters>): SurfaceStatisticsParameters => ({
  count: 0,
  direction: 0,
  height: 0,
  label: 0,
  mean: 0,
  mode: 0,
  outputOffset: 0,
  radius: 0,
  width: 0,
  ...overrides,
});

// Every pass a statistic takes, recorded onto one encoder, each with its own uniform so no write waits on a pass
export const createRecorder = (device: GPUDevice, encoder: GPUCommandEncoder) => {
  const pipelines = getSurfaceStatisticsPipelines(device);
  // Each uniform is released once its submit is made, which the device holds until the passes that read it finish
  const parameterBuffers: GPUBuffer[] = [];
  const dispatch = (
    pipeline: GPUComputePipeline,
    bindings: [number, GPUBuffer][],
    parameters: SurfaceStatisticsParameters,
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
  const dispatchPerPixel = (
    pipeline: GPUComputePipeline,
    bindings: [number, GPUBuffer][],
    parameters: SurfaceStatisticsParameters,
  ): void =>
    dispatch(pipeline, bindings, parameters, [Math.ceil(parameters.count / SURFACE_STATISTICS_WORKGROUP_SIZE), 1]);
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
      const parameters = getParameters({ count: width * height, height, radius, width });
      dispatch(
        pipelines.blur,
        [
          [0, source],
          [1, temporary],
          [2, weights],
        ],
        parameters,
        workgroups,
      );
      dispatch(
        pipelines.blur,
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
      mean: number = 0,
      label: number = 0,
    ): void =>
      dispatchPerPixel(
        pipelines.combine,
        [
          [3, first],
          [4, second],
          [5, mask],
          [6, output],
        ],
        getParameters({ count, label, mean, mode }),
      ),
    // Each output pixel is the mean of a two by two block of the source, which is `width` pixels wide
    halve: (source: GPUBuffer, destination: GPUBuffer, width: number, count: number): void =>
      dispatchPerPixel(
        pipelines.halve,
        [
          [3, source],
          [6, destination],
        ],
        getParameters({ count, width }),
      ),
    parameterBuffers,
    // A sum over the buffer's first `count` elements, its partial for each workgroup at the slot's offset
    reduce: (input: GPUBuffer, partials: GPUBuffer, count: number, slot: number): void =>
      dispatch(
        pipelines.reduce,
        [
          [7, input],
          [8, partials],
        ],
        getParameters({ count, outputOffset: slot * SURFACE_STATISTICS_PARTIAL_COUNT }),
        [SURFACE_STATISTICS_PARTIAL_COUNT, 1],
      ),
    // One pixel's similarity term for a label's window, read from its coverage and blurred planes
    similarity: (
      planes: {
        coverage: GPUBuffer;
        coverageMean: GPUBuffer;
        firstMean: GPUBuffer;
        firstSquare: GPUBuffer;
        productMean: GPUBuffer;
        secondMean: GPUBuffer;
        secondSquare: GPUBuffer;
      },
      output: GPUBuffer,
      count: number,
      isCoarsest: boolean,
    ): void =>
      dispatchPerPixel(
        pipelines.similarity,
        [
          [10, planes.coverage],
          [11, planes.coverageMean],
          [12, planes.firstMean],
          [13, planes.secondMean],
          [14, planes.firstSquare],
          [15, planes.secondSquare],
          [16, planes.productMean],
          [17, output],
        ],
        getParameters({ count, mode: isCoarsest ? 1 : 0 }),
      ),
  };
};
