import type { Chart } from "@/models/dashboard/chart/Chart";
import type { AChartFeatureResolver } from "@/models/resolvers/dashboard/chart/AChartFeatureResolver";
import { BasicResolver } from "@/models/resolvers/dashboard/chart/BasicResolver";
import { DataLabelsResolver } from "@/models/resolvers/dashboard/chart/DataLabelsResolver";

export const getAllFeatureResolvers = <T extends Chart["configuration"]>(): AChartFeatureResolver<T>[] => [
  new BasicResolver(),
  new DataLabelsResolver(),
];
