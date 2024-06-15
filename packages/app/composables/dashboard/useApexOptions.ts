import type { VisualType } from "@/models/dashboard/VisualType";
import type { Chart } from "@/models/dashboard/chart/Chart";
import { getActiveChartTypeResolvers } from "@/services/dashboard/chart/getActiveChartTypeResolvers";
import { getActiveVisualTypeResolvers } from "@/services/dashboard/visual/getActiveVisualTypeResolvers";
import type { ApexOptions } from "apexcharts";

export const useApexOptions = (
  chart: MaybeRefOrGetter<Chart>,
  visualType: MaybeRefOrGetter<VisualType>,
  initialOptions: ComputedRef<ApexOptions>,
) =>
  computed(() => {
    const options = initialOptions.value;
    const { type, configuration } = toValue(chart);
    const chartTypeResolvers = getActiveChartTypeResolvers(type);
    for (const chartTypeResolver of chartTypeResolvers) chartTypeResolver.handleConfiguration(options, configuration);

    const visualTypeValue = toValue(visualType);
    const visualTypeResolvers = getActiveVisualTypeResolvers(visualTypeValue);
    for (const visualTypeResolver of visualTypeResolvers) visualTypeResolver.handleConfiguration(options);

    return options;
  });
