import { resourceBinSortNameSchema } from "#shared/models/resource/ResourceBinSortName";
import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { ResourceSortNamePageSortMap } from "#shared/services/resource/ResourceSortNamePageSortMap";
import { createSortedPageInputSchema } from "@esposter/db-schema";

// The Recycle bin a page at a time, newest deletion first unless the table names another of its orders
export const readDeletedResourcesInputSchema = createSortedPageInputSchema(
  resourceBinSortNameSchema,
  ResourceSortNamePageSortMap,
  ResourceSortName.DeletedAtDesc,
).prefault({});
