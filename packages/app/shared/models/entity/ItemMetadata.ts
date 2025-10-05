import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class ItemMetadata {
  createdAt = new Date();
  deletedAt: Date | null = null;
  updatedAt = new Date();
}

export const ItemMetadataPropertyNames = getPropertyNames<ItemMetadata>();

export const itemMetadataSchema = z.object({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  updatedAt: z.date(),
}) satisfies z.ZodType<ItemMetadata>;
