import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { BasicPropsData } from "#src/assets/dashboard/demo/data/treemap/BasicPropsData";
import { DistributedPropsData } from "#src/assets/dashboard/demo/data/treemap/DistributedPropsData";

export const TreemapPropsDataMap = {
  [ChartType.Basic]: BasicPropsData,
  [ChartType.Distributed]: DistributedPropsData,
} as const;
