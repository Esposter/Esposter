// How a visual type draws the one aggregated value per category a dataset binding produces: as categories on an
// Axis with a series per aggregation, as the labels of a single series, as `{ x, y }` points, as one value over every
// Row with no category at all, or not at all — a Candlestick, box plot, range or bubble draws several values per
// Point, which no aggregation gives it
export enum VisualDatasetShape {
  Categories = "Categories",
  Labels = "Labels",
  None = "None",
  Points = "Points",
  Single = "Single",
}
