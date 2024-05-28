import type { ChartData } from "@/models/dashboard/chart/ChartData";
import { AreaChartType } from "@/models/dashboard/chart/area/AreaChartType";
import {
  BasicAreaChartConfiguration,
  basicAreaChartConfigurationSchema,
} from "@/models/dashboard/chart/area/BasicAreaChartConfiguration";
import { zodToJsonSchema } from "@/services/dashboard/zodToJsonSchema";

export const AreaChartTypeDataMap = {
  [AreaChartType.Basic]: {
    getInitialConfiguration: () => new BasicAreaChartConfiguration(),
    schema: zodToJsonSchema(basicAreaChartConfigurationSchema),
  },
} as const satisfies Record<AreaChartType, ChartData>;
