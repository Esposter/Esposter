import type { ChartType } from "@/models/dashboard/chart/ChartType";
import { getAllFeatureResolvers } from "@/services/dashboard/chart/getAllFeatureResolvers";
import { zodToJsonSchema } from "@/services/dashboard/zodToJsonSchema";
import { z } from "zod";

export const useSchema = (type: MaybeRefOrGetter<ChartType>) => {
  const featureResolvers = getAllFeatureResolvers();
  return computed(() => {
    const schema = z.object({});
    const typeValue = toValue(type);
    for (const featureResolver of featureResolvers)
      if (!featureResolver.isActive(typeValue)) continue;
      else featureResolver.handleSchema(schema);
    return zodToJsonSchema(schema);
  });
};
