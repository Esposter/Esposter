import type { Chart } from "#shared/models/dashboard/data/chart/Chart";
import type { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import type { AChartTypeResolver } from "#src/models/resolvers/dashboard/chart/AChartTypeResolver";

import { BasicResolver } from "#src/models/resolvers/dashboard/chart/BasicResolver";
import { ChartType3DResolver } from "#src/models/resolvers/dashboard/chart/ChartType3DResolver";
import { DistributedResolver } from "#src/models/resolvers/dashboard/chart/DistributedResolver";
import { DonutResolver } from "#src/models/resolvers/dashboard/chart/DonutResolver";
import { PyramidResolver } from "#src/models/resolvers/dashboard/chart/PyramidResolver";

const CHART_TYPE_RESOLVERS: AChartTypeResolver<Chart["configuration"]>[] = [
  new ChartType3DResolver(),
  new BasicResolver(),
  new DistributedResolver(),
  new DonutResolver(),
  new PyramidResolver(),
];

export const getActiveChartTypeResolvers = (type: ChartType) =>
  CHART_TYPE_RESOLVERS.filter((resolver) => resolver.checkIsActive(type));
