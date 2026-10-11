import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

// The content schema is the resource type's own, so each type's save input is this one call over its schema
export const createSaveResourceContentInputSchema = <TContentSchema extends z.ZodType>(contentSchema: TContentSchema) =>
  z.object({
    content: contentSchema,
    contentVersion: selectResourceInResourceSchema.shape.contentVersion,
    id: selectResourceInResourceSchema.shape.id,
  });
