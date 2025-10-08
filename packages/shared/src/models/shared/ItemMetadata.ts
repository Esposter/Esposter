import type { PropertyNames } from "@/util/types/PropertyNames";

import { getPropertyNames } from "@/util/getPropertyNames";
import { z } from "zod";

export class ItemMetadata {
  createdAt: Date = new Date();
  deletedAt: Date | null = null;
  updatedAt: Date = new Date();
}

export const ItemMetadataPropertyNames: PropertyNames<ItemMetadata> = getPropertyNames<ItemMetadata>();

export const itemMetadataSchema: z.ZodObject<{
  createdAt: z.ZodDate;
  deletedAt: z.ZodNullable<z.ZodDate>;
  updatedAt: z.ZodDate;
}> = z.object({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  updatedAt: z.date(),
}) satisfies z.ZodType<ItemMetadata>;
