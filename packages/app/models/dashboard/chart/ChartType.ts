import { z } from "zod";

export enum ChartType {
  Basic = "Basic",
  DataLabels = "DataLabels",
  Pyramid = "Pyramid",
}

export const chartTypeSchema = z.nativeEnum(ChartType) satisfies z.ZodType<ChartType>;
