import type { Chart } from "@/models/dashboard/chart/Chart";
import { getAllFeatureResolvers } from "@/services/dashboard/chart/getAllFeatureResolvers";
import type { ApexOptions } from "apexcharts";

export const useApexOptions = (chart: MaybeRefOrGetter<Chart>, initialOptions: ComputedRef<ApexOptions>) => {
  const featureResolvers = getAllFeatureResolvers();
  return computed(() => {
    const { type, configuration } = toValue(chart);
    const options = initialOptions.value;

    for (const featureResolver of featureResolvers) {
      if (!featureResolver.isActive(type)) continue;
      featureResolver.handleConfiguration(options, configuration);
    }

    return options;
  });
};
