import { z } from "zod/v4";

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
  PolarArea = "PolarArea",
  Radar = "Radar",
  RadialBar = "RadialBar",
  RangeArea = "RangeArea",
  RangeBar = "RangeBar",
  Scatter = "Scatter",
  Slope = "Slope",
  Treemap = "Treemap",
}

export const visualTypeSchema = z.enum(VisualType) satisfies z.ZodType<VisualType>;
