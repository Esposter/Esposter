import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import type { z } from "zod";

export class BasicLineChartConfiguration extends BaseChartConfiguration {}

export const basicLineChartConfigurationSchema =
  baseChartConfigurationSchema satisfies z.ZodType<BasicLineChartConfiguration>;
