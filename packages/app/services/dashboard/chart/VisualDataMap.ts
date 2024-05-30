import type { VisualData } from "@/models/dashboard/VisualData";
import { VisualType } from "@/models/dashboard/VisualType";
import type { Chart } from "@/models/dashboard/chart/Chart";
import { AreaChartType } from "@/models/dashboard/chart/area/AreaChartType";
import { AreaChartTypeDataMap } from "@/models/dashboard/chart/area/AreaChartTypeDataMap";
import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import { ColumnChartTypeDataMap } from "@/models/dashboard/chart/column/ColumnChartTypeDataMap";
import { LineChartType } from "@/models/dashboard/chart/line/LineChartType";
import { LineChartTypeDataMap } from "@/models/dashboard/chart/line/LineChartTypeDataMap";

export const VisualDataMap = {
  [VisualType.Area]: {
    typeEnum: AreaChartType,
    data: AreaChartTypeDataMap[AreaChartType.Basic],
  },
  [VisualType.Column]: {
    typeEnum: ColumnChartType,
    data: ColumnChartTypeDataMap[ColumnChartType.Basic],
  },
  [VisualType.Line]: {
    typeEnum: LineChartType,
    data: LineChartTypeDataMap[LineChartType.Basic],
  },
} as const satisfies Record<VisualType, VisualData<Chart>>;
