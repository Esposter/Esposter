import { resourceFilterInputSchema } from "#shared/models/db/resource/ResourceFilterInput";
import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { ResourceSortNamePageSortMap } from "#shared/services/resource/ResourceSortNamePageSortMap";
import { createPageInputSchema } from "@esposter/db-schema";

// A picker of one type's resources, newest first a page at a time. Published is the one filter it takes
export const readResourcesInputSchema = createPageInputSchema(
  ResourceSortNamePageSortMap[ResourceSortName.UpdatedAtDesc],
)
  .extend({ isPublished: resourceFilterInputSchema.shape.isPublished })
  .prefault({});
