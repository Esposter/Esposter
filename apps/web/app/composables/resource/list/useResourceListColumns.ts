import type { ResourceListSource } from "#src/models/resource/list/ResourceListSource";

import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { checkIsSortNameAvailable } from "#shared/services/resource/checkIsSortNameAvailable";
import { DEFAULT_HIDDEN_RESOURCE_COLUMN_KEYS } from "#src/services/resource/constants";
import { ResourceListSourceDefinitionMap } from "#src/services/resource/list/ResourceListSourceDefinitionMap";
import { ResourceHeaders } from "#src/services/resource/ResourceHeaders";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";

// Owns what "pinned" means, so the table and the column chooser cannot disagree: the column a source is
// Ordered by is always rendered and never offered as a checkbox, because a sort key the reader can hide is an
// Order nobody can explain. Name is the row's identity and is pinned for every source.
export const useResourceListColumns = (source: ResourceListSource) => {
  const { filter, pinnedColumnKey } = ResourceListSourceDefinitionMap[source];
  const hiddenColumnKeys = useLocalStorage<string[]>(
    LocalStorageKey.ResourceListHiddenColumns,
    DEFAULT_HIDDEN_RESOURCE_COLUMN_KEYS,
  );
  const checkIsPinned = (key: string) => key === ResourceListItemPropertyNames.name || key === pinnedColumnKey;
  // The column sorts by its last-accessed orders, so its header is offered as a sort only where they are available
  const isLastAccessedSortable = checkIsSortNameAvailable(ResourceSortName.LastAccessedAtDesc, filter.isAccessed);
  const visibleHeaders = computed(() =>
    ResourceHeaders.filter(({ key }) => checkIsPinned(key) || !hiddenColumnKeys.value.includes(key)).map((header) =>
      header.key === ResourceListItemPropertyNames.lastAccessedAt && !isLastAccessedSortable
        ? { ...header, isSortable: false }
        : header,
    ),
  );
  const toggleableHeaders = computed(() => ResourceHeaders.filter(({ key }) => !checkIsPinned(key)));
  const toggleColumn = (key: string) => {
    hiddenColumnKeys.value = hiddenColumnKeys.value.includes(key)
      ? hiddenColumnKeys.value.filter((columnKey) => columnKey !== key)
      : [...hiddenColumnKeys.value, key];
  };
  return { hiddenColumnKeys, toggleableHeaders, toggleColumn, visibleHeaders };
};
