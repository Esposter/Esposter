import { BasicPropsData } from "@/assets/dashboard/demo/data/funnel/BasicPropsData";
import { PyramidPropsData } from "@/assets/dashboard/demo/data/funnel/PyramidPropsData";
import { ChartType } from "@/shared/models/dashboard/data/chart/type/ChartType";

export const FunnelPropsDataMap = {
  [ChartType.Basic]: BasicPropsData,
  [ChartType.Pyramid]: PyramidPropsData,
} as const;
