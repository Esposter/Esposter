import type { Chart } from "@/shared/models/dashboard/data/chart/Chart";
import type { VisualType } from "@/shared/models/dashboard/data/VisualType";
import type { ApexOptions } from "apexcharts";

import { getActiveChartTypeResolvers } from "@/services/dashboard/chart/getActiveChartTypeResolvers";
import { getActiveVisualTypeResolvers } from "@/services/dashboard/visual/getActiveVisualTypeResolvers";

export const useApexOptions = (
  chart: MaybeRefOrGetter<Chart>,
  visualType: MaybeRefOrGetter<VisualType>,
  initialOptions: ComputedRef<ApexOptions>,
) =>
  computed(() => {
    const options = initialOptions.value;
    const visualTypeValue = toValue(visualType);
    const visualTypeResolvers = getActiveVisualTypeResolvers(visualTypeValue);
    for (const visualTypeResolver of visualTypeResolvers)
      visualTypeResolver.handleConfiguration(options, visualTypeValue);

    const { configuration, type } = toValue(chart);
    const chartTypeResolvers = getActiveChartTypeResolvers(type);
    for (const chartTypeResolver of chartTypeResolvers) chartTypeResolver.handleConfiguration(options, configuration);

    return options;
  });
