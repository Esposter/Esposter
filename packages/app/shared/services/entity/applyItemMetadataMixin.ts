import type { ItemMetadata } from "@esposter/shared";
import type { Class } from "type-fest";

export const applyItemMetadataMixin = <TBase extends Class<NonNullable<unknown>>>(Base: TBase) =>
  class ItemWithMetadata extends Base implements ItemMetadata {
    createdAt = new Date();
    deletedAt: Date | null = null;
    updatedAt = new Date();
  };
