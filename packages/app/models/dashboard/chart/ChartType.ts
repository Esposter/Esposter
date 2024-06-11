import { z } from "zod";

export enum ChartType {
  Basic = "Basic",
  DataLabels = "DataLabels",
  Pyramid = "Pyramid",
  "3D" = "3D",
}

export const chartTypeSchema = z.nativeEnum(ChartType) satisfies z.ZodType<ChartType>;
