import { resourceFilterInputSchema } from "#shared/models/db/resource/ResourceFilterInput";
import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { ResourceSortNamePageSortMap } from "#shared/services/resource/ResourceSortNamePageSortMap";
import { createPageInputSchema } from "@esposter/db-schema";
import { z } from "zod";

// A picker of one type's resources, newest first a page at a time. Published is the one filter it takes
export const readResourcesInputSchema = z
  .object({
    ...createPageInputSchema(ResourceSortNamePageSortMap[ResourceSortName.UpdatedAtDesc]).shape,
    isPublished: resourceFilterInputSchema.shape.isPublished,
  })
  .prefault({});
