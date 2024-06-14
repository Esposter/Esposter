import {
  BasicChartConfiguration,
  basicChartConfigurationSchema,
} from "@/models/dashboard/chart/BasicChartConfiguration";
import type { z } from "zod";

export class FunnelChartConfiguration extends BasicChartConfiguration {
  dataLabels? = true;
}

export const funnelChartConfigurationSchema = basicChartConfigurationSchema.omit({
  dataLabels: true,
}) satisfies z.ZodType<FunnelChartConfiguration>;
