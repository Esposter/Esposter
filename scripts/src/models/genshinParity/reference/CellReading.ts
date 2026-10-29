// One cell of a compared region's grid: its place as column and row, its mean difference in percent, and the mean colour
// Of the reference and of ours over its scored pixels
export interface CellReading {
  cell: [number, number];
  error: number;
  ours: [number, number, number];
  reference: [number, number, number];
}
