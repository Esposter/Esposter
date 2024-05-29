import type { ChartData } from "@/models/dashboard/chart/ChartData";
import {
  BasicColumnChartConfiguration,
  basicColumnChartConfigurationSchema,
} from "@/models/dashboard/chart/column/BasicColumnChartConfiguration";
import type { ColumnChartConfiguration } from "@/models/dashboard/chart/column/ColumnChartConfiguration";
import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import { BasicColumnChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/column/BasicColumnChartConfigurationResolver";
import { zodToJsonSchema } from "@/services/dashboard/zodToJsonSchema";

export const ColumnChartTypeDataMap = {
  [ColumnChartType.Basic]: {
    getInitialConfiguration: () => new BasicColumnChartConfiguration(),
    schema: zodToJsonSchema(basicColumnChartConfigurationSchema),
    resolver: new BasicColumnChartConfigurationResolver(),
  },
} as const satisfies Record<ColumnChartType, ChartData<ColumnChartConfiguration>>;
