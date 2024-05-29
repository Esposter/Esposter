import type { ChartData } from "@/models/dashboard/chart/ChartData";
import {
  BasicLineChartConfiguration,
  basicLineChartConfigurationSchema,
} from "@/models/dashboard/chart/line/BasicLineChartConfiguration";
import type { LineChartConfiguration } from "@/models/dashboard/chart/line/LineChartConfiguration";
import { LineChartType } from "@/models/dashboard/chart/line/LineChartType";
import { BasicLineChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/line/BasicLineChartConfigurationResolver";
import { zodToJsonSchema } from "@/services/dashboard/zodToJsonSchema";

export const LineChartTypeDataMap = {
  [LineChartType.Basic]: {
    getInitialConfiguration: () => new BasicLineChartConfiguration(),
    schema: zodToJsonSchema(basicLineChartConfigurationSchema),
    resolver: new BasicLineChartConfigurationResolver(),
  },
} as const satisfies Record<LineChartType, ChartData<LineChartConfiguration>>;
