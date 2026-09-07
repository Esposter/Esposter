import type { Chart } from "#shared/models/dashboard/data/chart/Chart";
import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { ApexOptions } from "apexcharts";

import { getActiveChartTypeResolvers } from "@/services/dashboard/chart/getActiveChartTypeResolvers";
import { getActiveVisualTypeResolvers } from "@/services/dashboard/visual/getActiveVisualTypeResolvers";

export const useApexOptions = (
  chart: MaybeRefOrGetter<Chart>,
  visualType: MaybeRefOrGetter<VisualType>,
  initialOptions: ComputedRef<ApexOptions>,
) =>
  computed(() => {
    // The resolvers layer their options in place, so handing them `initialOptions`' own cached object would
    // Leave every option behind in it — and a resolver that is no longer active never takes its own back out,
    // So the previous visual/chart type's options would keep applying. Each evaluation starts from a copy;
    // Shallow is enough, since a resolver only ever reassigns a top-level key with a fresh `defu` result
    const options = { ...initialOptions.value };
    const visualTypeValue = toValue(visualType);
    const visualTypeResolvers = getActiveVisualTypeResolvers(visualTypeValue);
    for (const visualTypeResolver of visualTypeResolvers)
      visualTypeResolver.handleConfiguration(options, visualTypeValue);

    const { configuration, type } = toValue(chart);
    const chartTypeResolvers = getActiveChartTypeResolvers(type);
    for (const chartTypeResolver of chartTypeResolvers) chartTypeResolver.handleConfiguration(options, configuration);

    return options;
  });
