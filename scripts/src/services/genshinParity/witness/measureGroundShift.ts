// A column's brightness at a fractional row, between its two nearest rows
const sample = (column: ArrayLike<number>, row: number): number => {
  const index = Math.floor(row);
  const share = row - index;
  return (column[index] ?? 0) * (1 - share) + (column[index + 1] ?? 0) * share;
};
// How far level ground moved toward the camera between two frames, in metres: each frame's column of the ground (its
// Brightness down the rows) read at every step across a band of distances, through the row each distance lands on,
// And the shift of the later frame's that best matches the earlier's by normalised cross-correlation, searched to a
// Largest shift in steps. A frame held, as a stalled recording holds them, reads no shift
export const measureGroundShift = (
  earlier: ArrayLike<number>,
  later: ArrayLike<number>,
  {
    band: [near, far],
    getRow,
    largestShift,
    step,
  }: { band: [number, number]; getRow: (distance: number) => number; largestShift: number; step: number },
): { correlation: number; shift: number } => {
  const distances = Array.from({ length: Math.floor((far - near) / step) + 1 }, (_, index) => near + index * step);
  const reference = distances.map((distance) => sample(earlier, getRow(distance)));
  const referenceMean = reference.reduce((sum, value) => sum + value, 0) / reference.length;
  const computeCorrelation = (shift: number): number => {
    const moved = distances.map((distance) => sample(later, getRow(distance - shift)));
    const movedMean = moved.reduce((sum, value) => sum + value, 0) / moved.length;
    let product = 0;
    let referenceSquares = 0;
    let movedSquares = 0;
    for (const [index, value] of reference.entries()) {
      const movedValue = (moved[index] ?? 0) - movedMean;
      product += (value - referenceMean) * movedValue;
      referenceSquares += (value - referenceMean) ** 2;
      movedSquares += movedValue ** 2;
    }
    return referenceSquares && movedSquares ? product / Math.sqrt(referenceSquares * movedSquares) : 0;
  };
  let best = { correlation: -Infinity, shift: 0 };
  for (let index = 0; index * step <= largestShift; index++) {
    const shift = index * step;
    const correlation = computeCorrelation(shift);
    if (correlation > best.correlation) best = { correlation, shift };
  }
  return best;
};
