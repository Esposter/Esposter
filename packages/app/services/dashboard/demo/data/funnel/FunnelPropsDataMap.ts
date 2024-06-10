import { ChartType } from "@/models/dashboard/chart/ChartType";
import { BasicPropsData } from "@/services/dashboard/demo/data/funnel/BasicPropsData";
import { PyramidPropsData } from "@/services/dashboard/demo/data/funnel/PyramidPropsData";

export const FunnelPropsDataMap = {
  [ChartType.Basic]: BasicPropsData,
  [ChartType.Pyramid]: PyramidPropsData,
} as const;
