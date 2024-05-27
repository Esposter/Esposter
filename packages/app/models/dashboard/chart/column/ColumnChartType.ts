import { z } from "zod";

export enum ColumnChartType {
  Basic = "Basic",
}

export const columnChartTypeSchema = z.nativeEnum(ColumnChartType) satisfies z.ZodType<ColumnChartType>;
