import type { ItemMetadata } from "#src/models/shared/ItemMetadata";
import type { Class } from "type-fest";

export interface ItemMetadataClass<TBase extends Class<NonNullable<unknown>>> {
  new (...args: ConstructorParameters<TBase>): InstanceType<TBase> & ItemMetadata;
  prototype: InstanceType<TBase> & ItemMetadata;
}
