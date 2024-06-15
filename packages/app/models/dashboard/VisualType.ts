import { z } from "zod";

export enum VisualType {
  Area = "Area",
  Bar = "Bar",
  BoxPlot = "BoxPlot",
  Bubble = "Bubble",
  Candlestick = "Candlestick",
  Column = "Column",
  Funnel = "Funnel",
  Heatmap = "Heatmap",
  Line = "Line",
  Pie = "Pie",
  RangeArea = "RangeArea",
  RangeBar = "RangeBar",
  Scatter = "Scatter",
  Slope = "Slope",
  Treemap = "Treemap",
}

export const visualTypeSchema = z.nativeEnum(VisualType) satisfies z.ZodType<VisualType>;
