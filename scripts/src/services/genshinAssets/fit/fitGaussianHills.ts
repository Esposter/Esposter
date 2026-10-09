import type { GaussianHills } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { GAUSSIAN_REACH_WIDTHS, getGaussianHillBlend } from "genshin-engine";

// How many times each width's hills are placed over what the widths above left
const PASSES_PER_WIDTH = 6;
// Peaks of a width's smoothed residual stand at least this many widths apart
const PEAK_SEPARATION_WIDTHS = 1.5;
// Sweeps re-solving every hill of a width once all are set
const BACKFIT_SWEEPS = 3;
// A residual smaller than this, in metres, places no hill
const MIN_RESIDUAL = 0.05;

interface FitGaussianHillsOptions {
  // The distances from the centre each error is reported within
  bands: readonly number[];
  center: readonly [number, number];
  // How far from the centre a sample weighs half as much as one at the centre
  falloff: number;
  getHeight: (x: number, z: number) => number;
  radius: number;
  step: number;
  // The hills' widths, widest first
  widths: readonly number[];
}
// A ground as our own generator draws it, Gaussian hills over a base height, fitted to a heightfield by matching
// Pursuit: the base at the heightfield's mean weighted toward the centre, then for each width, widest first, the
// Residual weighted toward the centre is smoothed at that width, a hill is
// Set at each of its peaks standing apart, and the hill's height is the weighted least-squares one over its reach, a
// Few passes a width. A point the heightfield does not reach weighs nothing. Returns the hills and the root-mean-square
// Error left within each band of the centre, in metres, over the points it reaches
export const fitGaussianHills = ({
  bands,
  center: [centerX, centerZ],
  falloff,
  getHeight,
  radius,
  step,
  widths,
}: FitGaussianHillsOptions): { errors: { rms: number; within: number }[]; hills: GaussianHills } => {
  const size = Math.floor((2 * radius) / step) + 1;
  const residual = new Float64Array(size * size);
  const weight = new Float64Array(size * size);
  const distance = new Float64Array(size * size);
  for (let row = 0; row < size; row++)
    for (let column = 0; column < size; column++) {
      const index = row * size + column;
      const x = centerX - radius + column * step;
      const z = centerZ - radius + row * step;
      const height = getHeight(x, z);
      const pointDistance = Math.hypot(x - centerX, z - centerZ);
      const isSampled = Number.isFinite(height);
      residual[index] = isSampled ? height : 0;
      distance[index] = isSampled ? pointDistance : Infinity;
      weight[index] = isSampled ? 1 / (1 + (pointDistance / falloff) ** 2) : 0;
    }
  // The base follows what the hills leave, its weighted mean folded in after each width, so no hill is spent on a level
  let base = 0;
  const recentre = (): void => {
    let weightedSum = 0;
    let weightSum = 0;
    for (const [index, value] of residual.entries()) {
      weightedSum += (weight[index] ?? 0) * value;
      weightSum += weight[index] ?? 0;
    }
    const shift = weightedSum / weightSum;
    base += shift;
    for (const [index, value] of residual.entries()) if ((weight[index] ?? 0) > 0) residual[index] = value - shift;
  };
  recentre();
  const blur = (values: Float64Array, widthCells: number): Float64Array => {
    const reachCells = Math.ceil(GAUSSIAN_REACH_WIDTHS * widthCells);
    const kernel = Array.from({ length: 2 * reachCells + 1 }, (_value, offset) =>
      Math.exp(-((offset - reachCells) ** 2) / (2 * widthCells ** 2)),
    );
    const kernelSum = kernel.reduce((sum, value) => sum + value, 0);
    const convolve = (source: Float64Array, isAlongRows: boolean): Float64Array =>
      Float64Array.from({ length: source.length }, (_value, index) => {
        const row = Math.floor(index / size);
        const column = index % size;
        let sum = 0;
        for (const [offset, value] of kernel.entries()) {
          const shift = offset - reachCells;
          const shiftedRow = isAlongRows ? row : Math.min(Math.max(row + shift, 0), size - 1);
          const shiftedColumn = isAlongRows ? Math.min(Math.max(column + shift, 0), size - 1) : column;
          sum += value * (source[shiftedRow * size + shiftedColumn] ?? 0);
        }
        return sum / kernelSum;
      });
    return convolve(convolve(values, true), false);
  };
  // A hill's height set to the weighted least-squares one over its reach against what every other hill leaves, its
  // Shape the one the ground draws it with
  const resolveHill = (hill: { column: number; height: number; row: number }, width: number): void => {
    const reachCells = Math.ceil((GAUSSIAN_REACH_WIDTHS * width) / step);
    const place = { width, x: hill.column * step, z: hill.row * step };
    const cells: [number, number][] = [];
    let numerator = 0;
    let denominator = 0;
    for (let row = Math.max(0, hill.row - reachCells); row <= Math.min(size - 1, hill.row + reachCells); row++)
      for (
        let column = Math.max(0, hill.column - reachCells);
        column <= Math.min(size - 1, hill.column + reachCells);
        column++
      ) {
        const index = row * size + column;
        const shape = getGaussianHillBlend(place, column * step, row * step);
        numerator += (weight[index] ?? 0) * shape * ((residual[index] ?? 0) + hill.height * shape);
        denominator += (weight[index] ?? 0) * shape * shape;
        cells.push([index, shape]);
      }
    if (denominator === 0) return;
    const height = numerator / denominator;
    for (const [index, shape] of cells) residual[index] = (residual[index] ?? 0) - (height - hill.height) * shape;
    hill.height = height;
  };
  const hills: GaussianHills["hills"] = [];
  const widthHills: { column: number; height: number; row: number }[] = [];
  for (const width of widths) {
    const widthCells = width / step;
    const separation = Math.max(1, Math.round(PEAK_SEPARATION_WIDTHS * widthCells));
    for (let pass = 0; pass < PASSES_PER_WIDTH; pass++) {
      const smoothed = blur(
        residual.map((value, index) => value * (weight[index] ?? 0)),
        widthCells,
      );
      const peaks: [number, number][] = [];
      for (let row = 0; row < size; row++)
        for (let column = 0; column < size; column++) {
          const value = Math.abs(smoothed[row * size + column] ?? 0);
          if (value < MIN_RESIDUAL) continue;
          let isPeak = true;
          for (let rowShift = -separation; rowShift <= separation && isPeak; rowShift++)
            for (let columnShift = -separation; columnShift <= separation && isPeak; columnShift++) {
              const neighbourRow = row + rowShift;
              const neighbourColumn = column + columnShift;
              if (neighbourRow < 0 || neighbourColumn < 0 || neighbourRow >= size || neighbourColumn >= size) continue;
              isPeak = Math.abs(smoothed[neighbourRow * size + neighbourColumn] ?? 0) <= value;
            }
          if (isPeak) peaks.push([row, column]);
        }
      for (const [peakRow, peakColumn] of peaks) {
        const hill = { column: peakColumn, height: 0, row: peakRow };
        resolveHill(hill, width);
        widthHills.push(hill);
      }
    }
    // Each hill set alone, its neighbours' heights are re-solved against it: a few sweeps of every hill of the width
    for (let sweep = 0; sweep < BACKFIT_SWEEPS; sweep++) for (const hill of widthHills) resolveHill(hill, width);
    for (const { column, height, row } of widthHills)
      hills.push({
        height: roundFitted(height),
        width,
        x: roundFitted(centerX - radius + column * step),
        z: roundFitted(centerZ - radius + row * step),
      });
    widthHills.length = 0;
    recentre();
  }
  const errors = bands.map((within) => {
    let sum = 0;
    let count = 0;
    for (const [index, value] of residual.entries())
      if ((distance[index] ?? 0) < within) {
        sum += value ** 2;
        count++;
      }
    return { rms: roundFitted(Math.sqrt(sum / count)), within };
  });
  return { errors, hills: { base: roundFitted(base), hills } };
};
