import type { VisualType } from "@/models/dashboard/VisualType";
import type { Chart } from "@/models/dashboard/chart/Chart";
import { getAllChartTypeResolvers } from "@/services/dashboard/chart/getAllChartTypeResolvers";
import type { ApexOptions } from "apexcharts";

export const useApexOptions = (
  chart: MaybeRefOrGetter<Chart>,
  visualType: MaybeRefOrGetter<VisualType>,
  initialOptions: ComputedRef<ApexOptions>,
) => {
  const featureResolvers = getAllChartTypeResolvers();
  return computed(() => {
    const { type, configuration } = toValue(chart);
    const visualTypeValue = toValue(visualType);
    const options = initialOptions.value;

    for (const featureResolver of featureResolvers) {
      if (!featureResolver.isActive(type)) continue;
      featureResolver.handleConfiguration(options, configuration, visualTypeValue);
    }

    return options;
  });
};
