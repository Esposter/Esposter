import { z } from "zod";

export enum VisualType {
  Area = "Area",
  Bar = "Bar",
  BoxPlot = "BoxPlot",
  Candlestick = "Candlestick",
  Column = "Column",
  Funnel = "Funnel",
  Line = "Line",
  RangeArea = "RangeArea",
  RangeBar = "RangeBar",
}

export const visualTypeSchema = z.nativeEnum(VisualType) satisfies z.ZodType<VisualType>;
