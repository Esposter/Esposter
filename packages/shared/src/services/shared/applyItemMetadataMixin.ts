import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import type { WithMetadata } from "@/models/shared/WithMetadata";
import type { Class } from "type-fest";

export const applyItemMetadataMixin = <TBase extends Class<NonNullable<unknown>>>(Base: TBase): WithMetadata<TBase> =>
  class ItemWithMetadata extends Base implements ItemMetadata {
    createdAt = new Date();
    deletedAt: Date | null = null;
    updatedAt = new Date();
  } as unknown as WithMetadata<TBase>;
