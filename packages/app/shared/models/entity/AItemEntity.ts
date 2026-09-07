import type { ToData } from "@esposter/shared";

import { applyItemMetadataMixin, getPropertyNames, Serializable } from "@esposter/shared";
import { z } from "zod";

class BaseAItemEntity extends Serializable {
  // Widened deliberately: inferred, `crypto.randomUUID()` types the field as a `${string}-…` template literal,
  // Which `z.uuid()`'s plain `string` output then fails to satisfy in every `satisfies z.ZodType<ToData<…>>`
  // Below this class
  id: string = crypto.randomUUID();
}

export const AItemEntity = applyItemMetadataMixin(BaseAItemEntity);
export type AItemEntity = typeof AItemEntity.prototype;

export const AItemEntityPropertyNames = getPropertyNames<AItemEntity>();

// This schema parses resource content read from the blob with plain JSON.parse, where every Date was
// Serialized to an ISO string. Coerce the item-metadata timestamps back to Date here so nothing relies
// On blanket ISO-string revival, which would also mis-revive genuine string fields (e.g. Sheet cells).
export const aItemEntitySchema = z.object({
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  id: z.uuid(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<ToData<AItemEntity>>;
