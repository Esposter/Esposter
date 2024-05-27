import { VisualType } from "@/models/dashboard/VisualType";
import type { ChartConfiguration } from "@/models/dashboard/chart/ChartConfiguration";
import { AreaChartConfiguration } from "@/models/dashboard/chart/area/AreaChartConfiguration";
import { LineChartConfiguration } from "@/models/dashboard/chart/line/LineChartConfiguration";

export const GetVisualTypeChartConfigurationMap = {
  [VisualType.Area]: () => new AreaChartConfiguration(),
  [VisualType.Column]: () => new ColumnChartConfiguration(),
  [VisualType.Line]: () => new LineChartConfiguration(),
} as const satisfies Record<VisualType, () => ChartConfiguration>;
