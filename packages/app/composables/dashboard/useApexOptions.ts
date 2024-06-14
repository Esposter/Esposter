import type { VisualType } from "@/models/dashboard/VisualType";
import type { Chart } from "@/models/dashboard/chart/Chart";
import { getAllChartTypeResolvers } from "@/services/dashboard/chart/getAllChartTypeResolvers";
import { getAllVisualTypeResolvers } from "@/services/dashboard/visual/getAllVisualTypeResolvers";
import type { ApexOptions } from "apexcharts";

export const useApexOptions = (
  chart: MaybeRefOrGetter<Chart>,
  visualType: MaybeRefOrGetter<VisualType>,
  initialOptions: ComputedRef<ApexOptions>,
) => {
  const chartTypeResolvers = getAllChartTypeResolvers();
  const visualTypeResolvers = getAllVisualTypeResolvers();
  return computed(() => {
    const options = initialOptions.value;
    const { type, configuration } = toValue(chart);

    for (const chartTypeResolver of chartTypeResolvers) {
      if (!chartTypeResolver.isActive(type)) continue;
      chartTypeResolver.handleConfiguration(options, configuration);
    }

    const visualTypeValue = toValue(visualType);

    for (const visualTypeResolver of visualTypeResolvers) {
      if (!visualTypeResolver.isActive(visualTypeValue)) continue;
      visualTypeResolver.handleConfiguration(options);
    }

    return options;
  });
};
