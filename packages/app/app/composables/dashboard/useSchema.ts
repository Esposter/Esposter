import type { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { getActiveChartTypeResolvers } from "@/services/dashboard/chart/getActiveChartTypeResolvers";
import { zodToJsonSchema } from "@/services/dashboard/jsonSchema/zodToJsonSchema";
import { getActiveVisualTypeResolvers } from "@/services/dashboard/visual/getActiveVisualTypeResolvers";
import { z } from "zod/v4";

export const useSchema = (chartType: ReadonlyRefOrGetter<ChartType>, visualType: ReadonlyRefOrGetter<VisualType>) =>
  computed(() => {
    let schema = z.object({});
    const chartTypeValue = toValue(chartType);
    const chartTypeResolvers = getActiveChartTypeResolvers(chartTypeValue);
    for (const chartTypeResolver of chartTypeResolvers) schema = chartTypeResolver.handleSchema(schema);

    const visualTypeValue = toValue(visualType);
    const visualTypeResolvers = getActiveVisualTypeResolvers(visualTypeValue);
    for (const visualTypeResolver of visualTypeResolvers) schema = visualTypeResolver.handleSchema(schema);

    return zodToJsonSchema(schema);
  });
