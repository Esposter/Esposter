import type { Chart } from "@/models/dashboard/chart/Chart";
import { ChartType3DResolver } from "@/models/resolvers/dashboard/chart/3DResolver";
import type { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { BasicResolver } from "@/models/resolvers/dashboard/chart/BasicResolver";
import { DataLabelsResolver } from "@/models/resolvers/dashboard/chart/DataLabelsResolver";
import { DistributedResolver } from "@/models/resolvers/dashboard/chart/DistributedResolver";
import { PyramidResolver } from "@/models/resolvers/dashboard/chart/PyramidResolver";

export const getAllChartTypeResolvers = <T extends Chart["configuration"]>(): AChartTypeResolver<T>[] => [
  new ChartType3DResolver(),
  new BasicResolver(),
  new DataLabelsResolver(),
  new DistributedResolver(),
  new PyramidResolver(),
];
