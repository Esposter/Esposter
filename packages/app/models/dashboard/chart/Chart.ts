import type { AreaChart } from "@/models/dashboard/chart/area/AreaChart";
import { areaChartSchema } from "@/models/dashboard/chart/area/AreaChart";
import type { ColumnChart } from "@/models/dashboard/chart/column/ColumnChart";
import { columnChartSchema } from "@/models/dashboard/chart/column/ColumnChart";
import type { LineChart } from "@/models/dashboard/chart/line/LineChart";
import { lineChartSchema } from "@/models/dashboard/chart/line/LineChart";
import { z } from "zod";

export type Chart = AreaChart | ColumnChart | LineChart;

export const chartSchema = z.union([areaChartSchema, columnChartSchema, lineChartSchema]) satisfies z.ZodType;
