import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import type { Class } from "type-fest";

interface WithMetadata<TBase extends Class<NonNullable<unknown>>> {
  new (...args: ConstructorParameters<TBase>): InstanceType<TBase> & ItemMetadata;
  prototype: InstanceType<TBase> & ItemMetadata;
}

export const applyItemMetadataMixin = <TBase extends Class<NonNullable<unknown>>>(Base: TBase): WithMetadata<TBase> =>
  class ItemWithMetadata extends Base implements ItemMetadata {
    createdAt = new Date();
    deletedAt: Date | null = null;
    updatedAt = new Date();
  } as unknown as WithMetadata<TBase>;
