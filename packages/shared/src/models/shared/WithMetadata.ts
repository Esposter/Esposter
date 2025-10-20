import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import type { Class } from "type-fest";

export interface WithMetadata<TBase extends Class<NonNullable<unknown>>> {
  new (...args: ConstructorParameters<TBase>): InstanceType<TBase> & ItemMetadata;
  prototype: InstanceType<TBase> & ItemMetadata;
}
