import { z } from "zod";

export interface ItemMetadata {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const itemMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
}) satisfies z.ZodType<ItemMetadata>;
