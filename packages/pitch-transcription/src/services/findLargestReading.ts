// The largest reading anywhere in a matrix, never under zero, read without spreading a recording's frames into one call
export const findLargestReading = (readings: number[][]): number => {
  let largest = 0;
  for (const row of readings) for (const reading of row) largest = Math.max(largest, reading);
  return largest;
};
