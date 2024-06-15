import type { Chart } from "@/models/dashboard/chart/Chart";
import type { ChartType } from "@/models/dashboard/chart/type/ChartType";
import { ChartType3DResolver } from "@/models/resolvers/dashboard/chart/3DResolver";
import type { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { BasicResolver } from "@/models/resolvers/dashboard/chart/BasicResolver";
import { DistributedResolver } from "@/models/resolvers/dashboard/chart/DistributedResolver";
import { PyramidResolver } from "@/models/resolvers/dashboard/chart/PyramidResolver";

export const getActiveChartTypeResolvers = <T extends Chart["configuration"]>(
  type: ChartType,
): AChartTypeResolver<T>[] =>
  [new ChartType3DResolver(), new BasicResolver(), new DistributedResolver(), new PyramidResolver()].filter((r) =>
    r.isActive(type),
  );
