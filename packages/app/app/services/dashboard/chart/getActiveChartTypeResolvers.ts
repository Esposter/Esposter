import type { Chart } from "#shared/models/dashboard/data/chart/Chart";
import type { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import type { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";

import { ChartType3DResolver } from "@/models/resolvers/dashboard/chart/3DResolver";
import { BasicResolver } from "@/models/resolvers/dashboard/chart/BasicResolver";
import { DistributedResolver } from "@/models/resolvers/dashboard/chart/DistributedResolver";
import { DonutResolver } from "@/models/resolvers/dashboard/chart/DonutResolver";
import { PyramidResolver } from "@/models/resolvers/dashboard/chart/PyramidResolver";

export const getActiveChartTypeResolvers = <T extends Chart["configuration"]>(
  type: ChartType,
): AChartTypeResolver<T>[] =>
  [
    new ChartType3DResolver(),
    new BasicResolver(),
    new DistributedResolver(),
    new DonutResolver(),
    new PyramidResolver(),
  ].filter((r) => r.isActive(type));
