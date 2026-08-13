import { blueprintParameterSchema } from "#shared/models/resource/blueprint/BlueprintParameter";
import { MAX_BLUEPRINT_PARAMETERS } from "#shared/services/resource/blueprint/constants";
import { selectResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deployBlueprintInputSchema = z.object({
  id: selectResourceSchema.shape.id,
  // Bounded exactly as the manifest declares the same data — every value is substituted into every string
  // Leaf of every entry and uploaded, so an unbounded record inflates one request into an unbounded write
  parameterValues: z
    .record(blueprintParameterSchema.shape.key, blueprintParameterSchema.shape.defaultValue)
    .refine((value) => Object.keys(value).length <= MAX_BLUEPRINT_PARAMETERS, {
      error: `Cannot deploy a blueprint with more than ${MAX_BLUEPRINT_PARAMETERS} parameters`,
    })
    .default({}),
});

export type DeployBlueprintInput = z.infer<typeof deployBlueprintInputSchema>;
