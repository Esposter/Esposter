import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { BasicPropsData } from "@/assets/dashboard/demo/data/treemap/BasicPropsData";
import { DistributedPropsData } from "@/assets/dashboard/demo/data/treemap/DistributedPropsData";

export const TreemapPropsDataMap = {
  [ChartType.Basic]: BasicPropsData,
  [ChartType.Distributed]: DistributedPropsData,
} as const;
