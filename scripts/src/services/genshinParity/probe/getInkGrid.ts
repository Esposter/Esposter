// The ink of each pixel of a luminance grid: its distance from the grid's mean luminance, the term the rows and columns
// Of the probe's ink are summed from
export const getInkGrid = (luminance: Float64Array): Float64Array => {
  let total = 0;
  for (const value of luminance) total += value;
  const mean = total / Math.max(luminance.length, 1);
  return luminance.map((value) => Math.abs(value - mean));
};
