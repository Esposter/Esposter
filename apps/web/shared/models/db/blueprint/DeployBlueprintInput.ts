import { blueprintParameterSchema } from "#shared/models/resource/blueprint/BlueprintParameter";
import { MAX_BLUEPRINT_PARAMETERS } from "#shared/services/resource/blueprint/constants";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

export const deployBlueprintInputSchema = z.object({
  id: selectResourceInResourceSchema.shape.id,
  // Bounded exactly as the manifest declares the same data — every value is substituted into every string
  // Leaf of every entry and uploaded, so an unbounded record inflates one request into an unbounded write
  parameterValues: createRecordSchema(
    blueprintParameterSchema.shape.key,
    blueprintParameterSchema.shape.defaultValue,
    MAX_BLUEPRINT_PARAMETERS,
  ).default({}),
});
export type DeployBlueprintInput = z.infer<typeof deployBlueprintInputSchema>;
