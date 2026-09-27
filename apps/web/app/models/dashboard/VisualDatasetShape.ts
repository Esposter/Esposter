// How a visual type draws the one aggregated value per category a dataset binding produces: as categories on an
// Axis with a series per aggregation, as the labels of a single series, as `{ x, y }` points, or not at all — a
// Candlestick, box plot, range or bubble draws several values per point, which no aggregation gives it
export enum VisualDatasetShape {
  Categories = "Categories",
  Labels = "Labels",
  None = "None",
  Points = "Points",
}
