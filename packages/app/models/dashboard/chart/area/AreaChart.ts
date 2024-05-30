import type { AreaChartType } from "@/models/dashboard/chart/area/AreaChartType";
import { areaChartTypeSchema } from "@/models/dashboard/chart/area/AreaChartType";
import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import { basicAreaChartConfigurationSchema } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import { z } from "zod";

export interface AreaChart {
  type: AreaChartType;
  configuration: BasicAreaChartConfiguration;
}

export const areaChartSchema = z.object({
  type: areaChartTypeSchema,
  configuration: basicAreaChartConfigurationSchema,
}) satisfies z.ZodType<AreaChart>;
