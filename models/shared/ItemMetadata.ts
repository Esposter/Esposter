import type { Constructor } from "@/util/types/Constructor";
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

export const applyItemMetadataMixin = <TBase extends Constructor<NonNullable<unknown>>>(Base: TBase) =>
  class ItemWithMetadata extends Base implements ItemMetadata {
    createdAt = new Date();
    updatedAt = new Date();
    deletedAt: Date | null = null;
  };
