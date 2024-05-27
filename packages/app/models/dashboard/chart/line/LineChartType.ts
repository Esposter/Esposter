import { z } from "zod";

export enum LineChartType {
  Basic = "Basic",
}

export const lineChartTypeSchema = z.nativeEnum(LineChartType) satisfies z.ZodType<LineChartType>;
