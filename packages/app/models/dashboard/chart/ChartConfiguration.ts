import type { AreaChartConfiguration } from "@/models/dashboard/chart/area/AreaChartConfiguration";
import { areaChartConfigurationSchema } from "@/models/dashboard/chart/area/AreaChartConfiguration";
import { columnChartConfigurationSchema } from "@/models/dashboard/chart/column/ColumnChartConfiguration";
import type { ColumnChartConfiguration } from "@/models/dashboard/chart/column/ColumnChartConfiguration";
import type { LineChartConfiguration } from "@/models/dashboard/chart/line/LineChartConfiguration";
import { lineChartConfigurationSchema } from "@/models/dashboard/chart/line/LineChartConfiguration";
import { z } from "zod";

export type ChartConfiguration = AreaChartConfiguration | ColumnChartConfiguration | LineChartConfiguration;

export const chartConfigurationSchema = z.union([
  areaChartConfigurationSchema,
  columnChartConfigurationSchema,
  lineChartConfigurationSchema,
]) satisfies z.ZodType<ChartConfiguration>;
