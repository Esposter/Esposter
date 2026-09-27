import type { ToData } from "@esposter/shared";

import { getPropertyNames, Serializable } from "@esposter/shared";
import { z } from "zod";

// An item stored inside a content blob. It is removed rather than soft deleted, so it keeps the timestamps and not
// The `deletedAt` of `ItemMetadata`, which mirrors the soft-deletable rows of Postgres and Azure Table
export class AItemEntity extends Serializable {
  createdAt = new Date();
  // Widened deliberately: inferred, `crypto.randomUUID()` types the field as a `${string}-…` template literal,
  // Which `z.uuid()`'s plain `string` output then fails to satisfy in every `satisfies z.ZodType<ToData<…>>`
  // Below this class
  id: string = crypto.randomUUID();
  updatedAt = new Date();
}

export const AItemEntityPropertyNames = getPropertyNames<AItemEntity>();
// This schema parses resource content read from the blob with plain JSON.parse, where every Date was
// Serialized to an ISO string. Coerce the item-metadata timestamps back to Date here so nothing relies
// On blanket ISO-string revival, which would also mis-revive genuine string fields (e.g. Sheet cells).
export const aItemEntitySchema = z.object({
  createdAt: z.coerce.date(),
  id: z.uuid(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<ToData<AItemEntity>>;
