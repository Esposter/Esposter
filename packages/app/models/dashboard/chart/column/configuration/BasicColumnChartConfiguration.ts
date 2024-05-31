import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import type { z } from "zod";

export class BasicColumnChartConfiguration extends BaseChartConfiguration {}

export const basicColumnChartConfigurationSchema =
  baseChartConfigurationSchema satisfies z.ZodType<BasicColumnChartConfiguration>;
