import type { PropertyNames } from "@/util/types/PropertyNames";

import { getPropertyNames } from "@/util/object/getPropertyNames";
import { z } from "zod";

export class ItemMetadata {
  createdAt: Date = new Date();
  deletedAt: Date | null = null;
  updatedAt: Date = new Date();
}

export const ItemMetadataPropertyNames: PropertyNames<ItemMetadata> = getPropertyNames<ItemMetadata>();

export const itemMetadataSchema: z.ZodType<ItemMetadata> = z.object({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  updatedAt: z.date(),
});
