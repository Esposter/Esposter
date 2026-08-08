import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";

import { DEFAULT_HIDDEN_RESOURCE_COLUMN_KEYS } from "@/services/resource/constants";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

// Owns what "pinned" means, so the table and the column chooser cannot disagree: the column a source is
// Ordered by is always rendered and never offered as a checkbox, because a sort key the reader can hide is an
// Order nobody can explain. Name is the row's identity and is pinned for every source.
export const useResourceListColumns = (source: ResourceListSource) => {
  const { pinnedColumnKey } = ResourceListSourceDefinitionMap[source];
  const hiddenColumnKeys = useLocalStorage<string[]>(
    LocalStorageKey.ResourceListHiddenColumns,
    DEFAULT_HIDDEN_RESOURCE_COLUMN_KEYS,
  );
  const checkIsPinned = (key: string) => key === "name" || key === pinnedColumnKey;
  const visibleHeaders = computed(() =>
    ResourceHeaders.filter(({ key }) => checkIsPinned(key) || !hiddenColumnKeys.value.includes(key)),
  );
  const toggleableHeaders = computed(() => ResourceHeaders.filter(({ key }) => !checkIsPinned(key)));
  const toggleColumn = (key: string) => {
    hiddenColumnKeys.value = hiddenColumnKeys.value.includes(key)
      ? hiddenColumnKeys.value.filter((columnKey) => columnKey !== key)
      : [...hiddenColumnKeys.value, key];
  };
  return { hiddenColumnKeys, toggleableHeaders, toggleColumn, visibleHeaders };
};
