import { AreaChartType, areaChartTypeSchema } from "@/models/dashboard/chart/area/AreaChartType";
import { z } from "zod";

export class AreaChartConfiguration {
  type = AreaChartType.Basic;
}

export const areaChartConfigurationSchema = z.object({
  type: areaChartTypeSchema,
}) satisfies z.ZodType<AreaChartConfiguration>;
