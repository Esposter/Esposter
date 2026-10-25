import { createResourceInputSchema } from "#shared/models/db/resource/CreateResourceInput";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

// A typeless create names the type the factory would otherwise bind, so one procedure serves every type
export const createResourceOfTypeInputSchema = createResourceInputSchema.extend(
  selectResourceInResourceSchema.pick({ type: true }).shape,
);
export type CreateResourceOfTypeInput = z.infer<typeof createResourceOfTypeInputSchema>;
