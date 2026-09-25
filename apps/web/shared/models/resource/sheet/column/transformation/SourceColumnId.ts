import { aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export interface SourceColumnId {
  sourceColumnId: string;
}

export const sourceColumnIdSchema = z.object({
  // A column's id, or "" while the transformation has not been pointed at one yet
  sourceColumnId: z.union([z.literal(""), aItemEntitySchema.shape.id]),
}) satisfies z.ZodType<SourceColumnId>;
