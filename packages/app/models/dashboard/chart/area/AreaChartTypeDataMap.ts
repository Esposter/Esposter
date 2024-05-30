import type { ChartData } from "@/models/dashboard/chart/ChartData";
import type { AreaChart } from "@/models/dashboard/chart/area/AreaChart";
import { AreaChartType } from "@/models/dashboard/chart/area/AreaChartType";
import {
  BasicAreaChartConfiguration,
  basicAreaChartConfigurationSchema,
} from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import { BasicAreaChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/area/BasicAreaChartConfigurationResolver";
import { zodToJsonSchema } from "@/services/dashboard/zodToJsonSchema";

export const AreaChartTypeDataMap = {
  [AreaChartType.Basic]: {
    getInitialConfiguration: () => new BasicAreaChartConfiguration(),
    schema: zodToJsonSchema(basicAreaChartConfigurationSchema),
    resolver: new BasicAreaChartConfigurationResolver(),
  },
} as const satisfies Record<AreaChartType, ChartData<AreaChart["configuration"]>>;
