import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceBinSortName } from "#shared/models/resource/ResourceBinSortName";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { resourceBinSortNameSchema } from "#shared/models/resource/ResourceBinSortName";
import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { getResourceSortName } from "@/services/resource/list/getResourceSortName";

// The order the Recycle bin's table reads, newest deletion first until a header is pressed
export const getResourceBinSortName = (sortBy: readonly SortItem<keyof ResourceListItem>[]): ResourceBinSortName =>
  getResourceSortName(sortBy, resourceBinSortNameSchema.options, ResourceSortName.DeletedAtDesc);
