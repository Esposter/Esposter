import type { VisualData } from "@/models/dashboard/VisualData";
import { VisualType } from "@/models/dashboard/VisualType";
import type { Chart } from "@/models/dashboard/chart/Chart";
import { AreaChartType } from "@/models/dashboard/chart/area/AreaChartType";
import { AreaChartTypeDataMap } from "@/models/dashboard/chart/area/AreaChartTypeDataMap";
import { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import { ColumnChartTypeDataMap } from "@/models/dashboard/chart/column/ColumnChartTypeDataMap";
import { BasicColumnChartConfiguration } from "@/models/dashboard/chart/column/configuration/BasicColumnChartConfiguration";
import { LineChartType } from "@/models/dashboard/chart/line/LineChartType";
import { LineChartTypeDataMap } from "@/models/dashboard/chart/line/LineChartTypeDataMap";
import { BasicLineChartConfiguration } from "@/models/dashboard/chart/line/configuration/BasicLineChartConfiguration";

export const VisualDataMap: Record<VisualType, VisualData<Chart>> = {
  [VisualType.Area]: {
    typeEnum: AreaChartType,
    getInitialChart: () => ({
      type: AreaChartType.Basic,
      configuration: new BasicAreaChartConfiguration(),
    }),
    chartDataMap: AreaChartTypeDataMap,
  },
  [VisualType.Column]: {
    typeEnum: ColumnChartType,
    getInitialChart: () => ({
      type: ColumnChartType.Basic,
      configuration: new BasicColumnChartConfiguration(),
    }),
    chartDataMap: ColumnChartTypeDataMap,
  },
  [VisualType.Line]: {
    typeEnum: LineChartType,
    getInitialChart: () => ({
      type: LineChartType.Basic,
      configuration: new BasicLineChartConfiguration(),
    }),
    chartDataMap: LineChartTypeDataMap,
  },
};
