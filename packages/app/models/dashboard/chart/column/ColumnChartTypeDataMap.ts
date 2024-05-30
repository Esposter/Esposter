import type { ChartData } from "@/models/dashboard/chart/ChartData";
import type { ColumnChart } from "@/models/dashboard/chart/column/ColumnChart";
import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import {
  BasicColumnChartConfiguration,
  basicColumnChartConfigurationSchema,
} from "@/models/dashboard/chart/column/configuration/BasicColumnChartConfiguration";
import { BasicColumnChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/column/BasicColumnChartConfigurationResolver";
import { zodToJsonSchema } from "@/services/dashboard/zodToJsonSchema";

export const ColumnChartTypeDataMap = {
  [ColumnChartType.Basic]: {
    getInitialChart: () => ({
      type: ColumnChartType.Basic,
      configuration: new BasicColumnChartConfiguration(),
    }),
    schema: zodToJsonSchema(basicColumnChartConfigurationSchema),
    resolver: new BasicColumnChartConfigurationResolver(),
  },
} as const satisfies Record<ColumnChartType, ChartData<ColumnChart>>;
