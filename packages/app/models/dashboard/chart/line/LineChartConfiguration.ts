import type { BasicLineChartConfiguration } from "@/models/dashboard/chart/line/BasicLineChartConfiguration";
import { basicLineChartConfigurationSchema } from "@/models/dashboard/chart/line/BasicLineChartConfiguration";
import type { z } from "zod";

export type LineChartConfiguration = BasicLineChartConfiguration;

export const lineChartConfigurationSchema =
  basicLineChartConfigurationSchema satisfies z.ZodType<LineChartConfiguration>;
