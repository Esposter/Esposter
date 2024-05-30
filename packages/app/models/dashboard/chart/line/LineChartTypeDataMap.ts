import type { ChartData } from "@/models/dashboard/chart/ChartData";
import {
  BasicLineChartConfiguration,
  basicLineChartConfigurationSchema,
} from "@/models/dashboard/chart/line/configuration/BasicLineChartConfiguration";
import {
  DataLabelsLineChartConfiguration,
  dataLabelsLineChartConfigurationSchema,
} from "@/models/dashboard/chart/line/configuration/DataLabelsLineChartConfiguration";
import type { LineChart } from "@/models/dashboard/chart/line/LineChart";
import { LineChartType } from "@/models/dashboard/chart/line/LineChartType";
import { BasicLineChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/line/BasicLineChartConfigurationResolver";
import { DataLabelsLineChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/line/DataLabelsLineChartConfiguration";
import { zodToJsonSchema } from "@/services/dashboard/zodToJsonSchema";

export const LineChartTypeDataMap = {
  [LineChartType.Basic]: {
    getInitialConfiguration: () => new BasicLineChartConfiguration(),
    schema: zodToJsonSchema(basicLineChartConfigurationSchema),
    resolver: new BasicLineChartConfigurationResolver(),
  },
  [LineChartType.DataLabels]: {
    getInitialConfiguration: () => new DataLabelsLineChartConfiguration(),
    schema: zodToJsonSchema(dataLabelsLineChartConfigurationSchema),
    resolver: new DataLabelsLineChartConfigurationResolver(),
  },
} as const satisfies Record<LineChartType, ChartData<LineChart["configuration"]>>;
