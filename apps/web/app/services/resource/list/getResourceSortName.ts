import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceSortName } from "#shared/models/resource/ResourceSortName";

// The named order a table's first sort item asks for, or the default when the item is not one the reader offers, such as
// A last-accessed order on a list whose rows the owner has not opened
export const getResourceSortName = <TSortName extends ResourceSortName>(
  sortBy: readonly SortItem<keyof ResourceListItem>[],
  allowedSortNames: readonly TSortName[],
  defaultSortName: NoInfer<TSortName>,
): TSortName => {
  const [sortItem] = sortBy;
  const sortName = sortItem ? `${sortItem.key}-${sortItem.order}` : defaultSortName;
  return allowedSortNames.find((allowedSortName) => allowedSortName === sortName) ?? defaultSortName;
};
