import type { ChartType } from "@/models/dashboard/chart/ChartType";
import { getAllFeatureResolvers } from "@/services/dashboard/chart/getAllFeatureResolvers";
import { zodToJsonSchema } from "@/services/dashboard/zodToJsonSchema";
import { z } from "zod";

export const useSchema = (type: ChartType) => {
  const featureResolvers = getAllFeatureResolvers();
  return computed(() => {
    const schema = z.object({});
    for (const { isActive, handleSchema } of featureResolvers)
      if (!isActive(type)) continue;
      else handleSchema(schema);
    return zodToJsonSchema(schema);
  });
};
