import type { LabelSimilarityInput } from "#parity/surfaceStatistics/LabelSimilarityInput";
import type { LabelSimilarityOutput } from "#parity/surfaceStatistics/LabelSimilarityOutput";
import type { BufferRead } from "#parity/surfaceStatistics/submitAndReadBuffers";

import { CombineMode } from "#parity/surfaceStatistics/CombineMode";
import {
  LABEL_SIMILARITY_SCALE_WEIGHTS,
  LABEL_SIMILARITY_WINDOW_SIGMA,
  SURFACE_STATISTICS_PARTIAL_COUNT,
} from "#parity/surfaceStatistics/constants";
import { createRecorder } from "#parity/surfaceStatistics/createRecorder";
import { createStorageBuffer } from "#parity/surfaceStatistics/createStorageBuffer";
import { destroyBuffers } from "#parity/surfaceStatistics/destroyBuffers";
import { getBlurWeights } from "#parity/surfaceStatistics/getBlurWeights";
import { getSlotSum } from "#parity/surfaceStatistics/getSlotSum";
import { getSurfaceStatisticsDevice } from "#parity/surfaceStatistics/getSurfaceStatisticsDevice";
import { submitAndReadBuffers } from "#parity/surfaceStatistics/submitAndReadBuffers";
import { uploadStorageBuffer } from "#parity/surfaceStatistics/uploadStorageBuffer";
import { takeOne } from "@esposter/shared";

// The Gaussian window's radius, out to three sigmas as the blur reads it
const WINDOW_RADIUS = Math.ceil(3 * LABEL_SIMILARITY_WINDOW_SIGMA);

// The buffers one scale of the image pyramid holds: a label's planes and their blurs, the scratch between them, the
// Term, and the sums over every label
interface ScaleBuffers {
  count: number;
  coverage: GPUBuffer;
  coverageMean: GPUBuffer;
  first: GPUBuffer;
  firstMean: GPUBuffer;
  firstSquare: GPUBuffer;
  height: number;
  productMean: GPUBuffer;
  quotient: GPUBuffer;
  scratch: GPUBuffer;
  second: GPUBuffer;
  secondMean: GPUBuffer;
  secondSquare: GPUBuffer;
  shareSums: Sums;
  temporary: GPUBuffer;
  term: GPUBuffer;
  termSums: Sums;
  width: number;
}
// A running sum over the labels, added to by writing `next` from `current`, then swapped so `current` holds the sum
interface Sums {
  current: GPUBuffer;
  next: GPUBuffer;
}

const createSums = (device: GPUDevice, count: number): Sums => ({
  current: createStorageBuffer(device, count),
  next: createStorageBuffer(device, count),
});
const createScaleBuffers = (device: GPUDevice, width: number, height: number): ScaleBuffers => {
  const count = width * height;
  const createBuffer = (): GPUBuffer => createStorageBuffer(device, count);
  return {
    count,
    coverage: createBuffer(),
    coverageMean: createBuffer(),
    first: createBuffer(),
    firstMean: createBuffer(),
    firstSquare: createBuffer(),
    height,
    productMean: createBuffer(),
    quotient: createBuffer(),
    scratch: createBuffer(),
    second: createBuffer(),
    secondMean: createBuffer(),
    secondSquare: createBuffer(),
    shareSums: createSums(device, count),
    temporary: createBuffer(),
    term: createBuffer(),
    termSums: createSums(device, count),
    width,
  };
};
const listScaleBuffers = (buffers: ScaleBuffers): GPUBuffer[] => [
  buffers.coverage,
  buffers.coverageMean,
  buffers.first,
  buffers.firstMean,
  buffers.firstSquare,
  buffers.productMean,
  buffers.quotient,
  buffers.scratch,
  buffers.second,
  buffers.secondMean,
  buffers.secondSquare,
  buffers.temporary,
  buffers.term,
  buffers.shareSums.current,
  buffers.shareSums.next,
  buffers.termSums.current,
  buffers.termSums.next,
];

// The similarity of each label between two grey images, as `scoreLabelSimilarity` reads it on the CPU, with each
// Label's blurs, products and terms computed on the GPU. A label's window at each scale is built from its coverage
// Planes: the blurred coverage, the blurred first and second, and the blurred squares and product over the coverage. The
// Terms are summed per label on the GPU, and each scale's term map is the sum of every label's term over its share
export const computeLabelSimilarity = async ({
  height,
  labelCount,
  labels,
  reference,
  shot,
  width,
}: LabelSimilarityInput): Promise<LabelSimilarityOutput> => {
  const device = await getSurfaceStatisticsDevice();
  const scales = LABEL_SIMILARITY_SCALE_WEIGHTS.map((_weight, scale) =>
    createScaleBuffers(device, Math.floor(width / 2 ** scale), Math.floor(height / 2 ** scale)),
  );
  const labelBuffer = uploadStorageBuffer(device, labels);
  const referenceBuffer = uploadStorageBuffer(device, reference);
  const shotBuffer = uploadStorageBuffer(device, shot);
  const weightBuffer = uploadStorageBuffer(device, getBlurWeights(LABEL_SIMILARITY_WINDOW_SIGMA));
  const partialLength = labelCount * scales.length * 2 * SURFACE_STATISTICS_PARTIAL_COUNT;
  const partialBuffer = createStorageBuffer(device, partialLength);
  // A label's term and count at a scale, as two slots of the partials: the term's sum first, then the coverage's
  const slotOf = (label: number, scale: number, kind: number): number => (label * scales.length + scale) * 2 + kind;
  const presentLabels = [...new Set(labels)].filter((label) => label >= 0 && label < labelCount);

  const encoder = device.createCommandEncoder();
  const recorder = createRecorder(device, encoder);
  for (const label of presentLabels)
    for (const [scale, buffers] of scales.entries()) {
      const { count, height: levelHeight, width: levelWidth } = buffers;
      const isCoarsest = scale === scales.length - 1;
      // The finest scale's planes are the label's coverage and the two images under it, the coarser ones halved below
      if (scale === 0) {
        recorder.combine(
          labelBuffer,
          labelBuffer,
          labelBuffer,
          buffers.coverage,
          count,
          CombineMode.Coverage,
          0,
          label,
        );
        recorder.combine(
          referenceBuffer,
          buffers.coverage,
          buffers.coverage,
          buffers.first,
          count,
          CombineMode.Product,
        );
        recorder.combine(shotBuffer, buffers.coverage, buffers.coverage, buffers.second, count, CombineMode.Product);
      }
      const blur = (source: GPUBuffer, destination: GPUBuffer): void =>
        recorder.blur(source, destination, buffers.temporary, weightBuffer, levelWidth, levelHeight, WINDOW_RADIUS);
      // A product of two planes over the coverage, the quotient each pixel's share of the blur's coverage
      const productOverCoverage = (first: GPUBuffer, second: GPUBuffer, output: GPUBuffer): void => {
        recorder.combine(first, second, second, buffers.scratch, count, CombineMode.Product);
        recorder.combine(buffers.scratch, buffers.coverage, buffers.coverage, output, count, CombineMode.Ratio);
      };
      blur(buffers.coverage, buffers.coverageMean);
      blur(buffers.first, buffers.firstMean);
      blur(buffers.second, buffers.secondMean);
      productOverCoverage(buffers.first, buffers.first, buffers.quotient);
      blur(buffers.quotient, buffers.firstSquare);
      productOverCoverage(buffers.second, buffers.second, buffers.quotient);
      blur(buffers.quotient, buffers.secondSquare);
      productOverCoverage(buffers.first, buffers.second, buffers.quotient);
      blur(buffers.quotient, buffers.productMean);
      recorder.similarity(buffers, buffers.term, count, isCoarsest);
      recorder.reduce(buffers.term, partialBuffer, count, slotOf(label, scale, 0));
      recorder.reduce(buffers.coverage, partialBuffer, count, slotOf(label, scale, 1));
      recorder.combine(
        buffers.termSums.current,
        buffers.term,
        buffers.term,
        buffers.termSums.next,
        count,
        CombineMode.Sum,
      );
      [buffers.termSums.current, buffers.termSums.next] = [buffers.termSums.next, buffers.termSums.current];
      recorder.combine(
        buffers.shareSums.current,
        buffers.coverage,
        buffers.coverage,
        buffers.shareSums.next,
        count,
        CombineMode.Sum,
      );
      [buffers.shareSums.current, buffers.shareSums.next] = [buffers.shareSums.next, buffers.shareSums.current];
      if (!isCoarsest) {
        const coarser = takeOne(scales, scale + 1);
        recorder.halve(buffers.coverage, coarser.coverage, levelWidth, coarser.count);
        recorder.halve(buffers.first, coarser.first, levelWidth, coarser.count);
        recorder.halve(buffers.second, coarser.second, levelWidth, coarser.count);
      }
    }

  const reads: BufferRead[] = [
    { buffer: partialBuffer, length: partialLength },
    ...scales.flatMap((buffers) => [
      { buffer: buffers.termSums.current, length: buffers.count },
      { buffer: buffers.shareSums.current, length: buffers.count },
    ]),
  ];
  const [partialSums = new Float32Array(), ...scaleReads] = await submitAndReadBuffers(device, encoder, reads);
  // Each scale's term map is its term sums over its share sums, NaN where no label reaches
  const termMaps = scales.map((buffers, scale) => {
    const terms = takeOne(scaleReads, 2 * scale);
    const shares = takeOne(scaleReads, 2 * scale + 1);
    return {
      height: buffers.height,
      terms: Float32Array.from(terms, (term, index) =>
        (shares[index] ?? 0) > 0 ? term / (shares[index] ?? 1) : Number.NaN,
      ),
      width: buffers.width,
    };
  });
  // A label's similarity is the product of its scales' terms, each raised to its weight, over the scales it reaches
  const labelSimilarities = Array.from({ length: labelCount }, (_value, label) => {
    if (!presentLabels.includes(label)) return { scales: [], similarity: 1 };
    let similarity = 1;
    const scaleTerms: number[] = [];
    for (const [scale, weight] of LABEL_SIMILARITY_SCALE_WEIGHTS.entries()) {
      const count = getSlotSum(partialSums, slotOf(label, scale, 1));
      if (count <= 0) continue;
      const term = Math.max(getSlotSum(partialSums, slotOf(label, scale, 0)) / count, 0);
      scaleTerms.push(term);
      similarity *= term ** weight;
    }
    return { scales: scaleTerms, similarity };
  });

  destroyBuffers([
    labelBuffer,
    referenceBuffer,
    shotBuffer,
    weightBuffer,
    partialBuffer,
    ...scales.flatMap(listScaleBuffers),
    ...recorder.parameterBuffers,
  ]);
  return { labelSimilarities, termMaps };
};
