import type { VisualType } from "@/models/dashboard/VisualType";
import type { ChartType } from "@/models/dashboard/chart/type/ChartType";
import { getAllChartTypeResolvers } from "@/services/dashboard/chart/getAllChartTypeResolvers";
import { zodToJsonSchema } from "@/services/dashboard/jsonSchema/zodToJsonSchema";
import { getAllVisualTypeResolvers } from "@/services/dashboard/visual/getAllVisualTypeResolvers";
import { z } from "zod";

export const useSchema = (type: MaybeRefOrGetter<ChartType>, visualType: MaybeRefOrGetter<VisualType>) => {
  const chartTypeResolvers = getAllChartTypeResolvers();
  const visualTypeResolvers = getAllVisualTypeResolvers();
  return computed(() => {
    let schema = z.object({});
    const typeValue = toValue(type);

    for (const chartTypeResolver of chartTypeResolvers) {
      if (!chartTypeResolver.isActive(typeValue)) continue;
      schema = chartTypeResolver.handleSchema(schema);
    }

    const visualTypeValue = toValue(visualType);

    for (const visualTypeResolver of visualTypeResolvers) {
      if (!visualTypeResolver.isActive(visualTypeValue)) continue;
      schema = visualTypeResolver.handleSchema(schema);
    }

    return zodToJsonSchema(schema);
  });
};
