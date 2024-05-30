import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import { z } from "zod";

export class DataLabelsLineChartConfiguration extends BaseChartConfiguration {}

export const dataLabelsLineChartConfigurationSchema = z
  .object({})
  .merge(baseChartConfigurationSchema) satisfies z.ZodType<DataLabelsLineChartConfiguration>;
