import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import type { z } from "zod";

export class DataLabelsLineChartConfiguration extends BaseChartConfiguration {}

export const dataLabelsLineChartConfigurationSchema =
  baseChartConfigurationSchema satisfies z.ZodType<DataLabelsLineChartConfiguration>;
