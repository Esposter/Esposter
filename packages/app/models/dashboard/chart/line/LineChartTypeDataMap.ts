import type { ChartData } from "@/models/dashboard/chart/ChartData";
import {
  BasicLineChartConfiguration,
  basicLineChartConfigurationSchema,
} from "@/models/dashboard/chart/line/BasicLineChartConfiguration";
import { LineChartType } from "@/models/dashboard/chart/line/LineChartType";
import { zodToJsonSchema } from "zod-to-json-schema";

export const LineChartTypeDataMap = {
  [LineChartType.Basic]: {
    getInitialConfiguration: () => new BasicLineChartConfiguration(),
    schema: zodToJsonSchema(basicLineChartConfigurationSchema),
  },
} as const satisfies Record<LineChartType, ChartData>;
