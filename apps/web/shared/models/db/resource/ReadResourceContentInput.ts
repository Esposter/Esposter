import { jsonPointerSchema } from "#shared/models/db/resource/JsonPointer";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { createPageInputSchema, SortOrder } from "@esposter/db-schema";

// The page an array at the pointer is answered in, from the index of its first item. The array keeps its own order
const RESOURCE_CONTENT_ITEM_SORT = { keys: ["index"], order: SortOrder.Asc } as const;

export const readResourceContentInputSchema = createPageInputSchema(RESOURCE_CONTENT_ITEM_SORT)
  .extend({ ...resourceIdInputSchema.shape, pointer: jsonPointerSchema.default("") })
  // The index a page starts at is a position in the array, so a cursor holding anything else is refused here
  .refine(
    ({ cursor }) =>
      cursor.values.every((index) => typeof index === "number" && Number.isSafeInteger(index) && index >= 0),
    { error: "A cursor names an index of the array, a non-negative integer", path: ["cursor"] },
  );
