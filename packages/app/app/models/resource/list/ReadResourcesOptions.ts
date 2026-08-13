import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

export interface ReadResourcesOptions {
  itemsPerPage: number;
  page: number;
  sortBy: SortItem<keyof ResourceListItem>[];
}
