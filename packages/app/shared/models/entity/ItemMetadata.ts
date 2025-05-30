import type { Class } from "type-fest";

import { z } from "zod/v4";

export class ItemMetadata {
  createdAt = new Date();
  deletedAt: Date | null = null;
  updatedAt = new Date();
}

export const itemMetadataSchema = z.object({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  updatedAt: z.date(),
}) satisfies z.ZodType<ItemMetadata>;

export const applyItemMetadataMixin = <TBase extends Class<NonNullable<unknown>>>(Base: TBase) =>
  class ItemWithMetadata extends Base implements ItemMetadata {
    createdAt = new Date();
    deletedAt: Date | null = null;
    updatedAt = new Date();
  };
