import { z } from "zod";

// A card and a table lead the picker, since they are the plainest visuals: one number, and the exact values behind a chart
export enum VisualType {
  Card = "Card",
  Table = "Table",
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

export const VisualTypes: ReadonlySet<VisualType> = new Set(Object.values(VisualType));
