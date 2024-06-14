import type { ChartType } from "@/models/dashboard/chart/type/ChartType";
import { getAllChartTypeResolvers } from "@/services/dashboard/chart/getAllChartTypeResolvers";
import { zodToJsonSchema } from "@/services/dashboard/zodToJsonSchema";
import { z } from "zod";

export const useSchema = (type: MaybeRefOrGetter<ChartType>) => {
  const featureResolvers = getAllChartTypeResolvers();
  return computed(() => {
    let schema = z.object({});
    const typeValue = toValue(type);
    for (const featureResolver of featureResolvers) {
      if (!featureResolver.isActive(typeValue)) continue;
      schema = featureResolver.handleSchema(schema);
    }
    return zodToJsonSchema(schema);
  });
};
