// A cell's running totals while its pixels are summed: how many scored pixels it holds, their summed greyscale difference,
// and each RGB channel's sum over the reference and over ours
export interface CellSum {
  count: number;
  difference: number;
  ours: number[];
  reference: number[];
}
