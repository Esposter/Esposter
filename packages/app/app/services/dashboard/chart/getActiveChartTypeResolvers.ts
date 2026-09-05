import type { Chart } from "#shared/models/dashboard/data/chart/Chart";
import type { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import type { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";

import { ChartType3DResolver } from "@/models/resolvers/dashboard/chart/3DResolver";
import { BasicResolver } from "@/models/resolvers/dashboard/chart/BasicResolver";
import { DistributedResolver } from "@/models/resolvers/dashboard/chart/DistributedResolver";
import { DonutResolver } from "@/models/resolvers/dashboard/chart/DonutResolver";
import { PyramidResolver } from "@/models/resolvers/dashboard/chart/PyramidResolver";

const chartTypeResolvers: AChartTypeResolver<Chart["configuration"]>[] = [
  new ChartType3DResolver(),
  new BasicResolver(),
  new DistributedResolver(),
  new DonutResolver(),
  new PyramidResolver(),
];

export const getActiveChartTypeResolvers = (type: ChartType): AChartTypeResolver<Chart["configuration"]>[] =>
  chartTypeResolvers.filter((resolver) => resolver.isActive(type));
