import { BasicPropsData } from "@/assets/dashboard/demo/data/treemap/BasicPropsData";
import { DistributedPropsData } from "@/assets/dashboard/demo/data/treemap/DistributedPropsData";
import { ChartType } from "@/models/dashboard/chart/type/ChartType";

export const TreemapPropsDataMap = {
  [ChartType.Basic]: BasicPropsData,
  [ChartType.Distributed]: DistributedPropsData,
} as const;
