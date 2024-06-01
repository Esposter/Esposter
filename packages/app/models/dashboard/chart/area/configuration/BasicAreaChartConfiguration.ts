import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import type { z } from "zod";

export class BasicAreaChartConfiguration extends BaseChartConfiguration {}

export const basicAreaChartConfigurationSchema =
  baseChartConfigurationSchema satisfies z.ZodType<BasicAreaChartConfiguration>;
