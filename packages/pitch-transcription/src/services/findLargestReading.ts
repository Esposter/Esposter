// The largest reading anywhere in a matrix, never under zero, read without spreading a recording's frames into one call
export const findLargestReading = (readings: number[][]): number =>
  readings.reduce((largest, row) => row.reduce((rowLargest, reading) => Math.max(rowLargest, reading), largest), 0);
