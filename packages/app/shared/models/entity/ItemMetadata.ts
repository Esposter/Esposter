import type { Class } from "type-fest";

import { z } from "zod";

export interface ItemMetadata {
  createdAt: Date;
  deletedAt: Date | null;
  updatedAt: Date;
}

export const itemMetadataSchema = z.object({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  updatedAt: z.date(),
}) as const satisfies z.ZodType<ItemMetadata>;

export const applyItemMetadataMixin = <TBase extends Class<NonNullable<unknown>>>(Base: TBase) =>
  class ItemWithMetadata extends Base implements ItemMetadata {
    createdAt = new Date();
    deletedAt: Date | null = null;
    updatedAt = new Date();
  };
