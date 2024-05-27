import type { ChartData } from "@/models/dashboard/chart/ChartData";
import {
  BasicColumnChartConfiguration,
  basicColumnChartConfigurationSchema,
} from "@/models/dashboard/chart/column/BasicColumnChartConfiguration";
import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import { zodToJsonSchema } from "zod-to-json-schema";

export const ColumnChartTypeDataMap = {
  [ColumnChartType.Basic]: {
    getInitialConfiguration: () => new BasicColumnChartConfiguration(),
    schema: zodToJsonSchema(basicColumnChartConfigurationSchema),
  },
} as const satisfies Record<ColumnChartType, ChartData>;
