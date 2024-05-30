import { z } from "zod";

export enum LineChartType {
  Basic = "Basic",
  DataLabels = "DataLabels",
}

export const lineChartTypeSchema = z.nativeEnum(LineChartType) satisfies z.ZodType<LineChartType>;
