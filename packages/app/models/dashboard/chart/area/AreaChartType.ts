import { z } from "zod";

export enum AreaChartType {
  Basic = "Basic",
}

export const areaChartTypeSchema = z.nativeEnum(AreaChartType) satisfies z.ZodType<AreaChartType>;
