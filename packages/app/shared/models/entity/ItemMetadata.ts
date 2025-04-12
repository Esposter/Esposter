import type { Type } from "arktype";
import type { Class } from "type-fest";

import { type } from "arktype";

export class ItemMetadata {
  createdAt = new Date();
  deletedAt: Date | null = null;
  updatedAt = new Date();
}

export const itemMetadataSchema = type({
  createdAt: "Date",
  deletedAt: "Date | null",
  updatedAt: "Date",
}) satisfies Type<ItemMetadata>;

export const applyItemMetadataMixin = <TBase extends Class<NonNullable<unknown>>>(Base: TBase) =>
  class ItemWithMetadata extends Base implements ItemMetadata {
    createdAt = new Date();
    deletedAt: Date | null = null;
    updatedAt = new Date();
  };
