import type { ItemMetadata } from "#src/models/shared/ItemMetadata";
import type { ItemMetadataClass } from "#src/models/shared/ItemMetadataClass";
import type { Class } from "type-fest";

// A mixin's class expression types as an anonymous subclass of `TBase`, which TypeScript cannot relate back to
// The generic constructor the return type names — the laundering is the mixin pattern rather than a type this
// Could state
export const applyItemMetadataMixin = <TBase extends Class<NonNullable<unknown>>>(
  Base: TBase,
): ItemMetadataClass<TBase> =>
  // eslint-disable-next-line no-restricted-syntax -- The mixin's class expression has no overlap with its return type
  class ItemWithMetadata extends Base implements ItemMetadata {
    createdAt = new Date();
    deletedAt: Date | null = null;
    updatedAt = new Date();
  } as unknown as ItemMetadataClass<TBase>;
