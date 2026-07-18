import { selectResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deployBlueprintInputSchema = z.object({
  id: selectResourceSchema.shape.id,
  parameterValues: z.record(z.string(), z.string()).default({}),
});

export type DeployBlueprintInput = z.infer<typeof deployBlueprintInputSchema>;
