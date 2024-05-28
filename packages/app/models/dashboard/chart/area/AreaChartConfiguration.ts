import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/BasicAreaChartConfiguration";
import { basicAreaChartConfigurationSchema } from "@/models/dashboard/chart/area/BasicAreaChartConfiguration";
import type { z } from "zod";

export type AreaChartConfiguration = BasicAreaChartConfiguration;

export const areaChartConfigurationSchema =
  basicAreaChartConfigurationSchema satisfies z.ZodType<AreaChartConfiguration>;
