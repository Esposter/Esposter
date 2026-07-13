import type { Resource } from "@esposter/db-schema";

// Vuetify's selection model only carries ids, so full rows are remembered here — bulk delete/export can then list names across page boundaries
export const useResourceSelection = <TResource extends Pick<Resource, "id">>(items: Ref<TResource[]>) => {
  const selectedIds = ref<string[]>([]);
  const selectedResources = shallowRef<TResource[]>([]);
  const updateSelection = (ids: string[]) => {
    selectedIds.value = ids;
    const idSet = new Set(ids);
    const newSelectedResources = selectedResources.value.filter(({ id }) => idSet.has(id));
    const keptIds = new Set(newSelectedResources.map(({ id }) => id));
    newSelectedResources.push(...items.value.filter(({ id }) => idSet.has(id) && !keptIds.has(id)));
    selectedResources.value = newSelectedResources;
  };
  const clearSelection = () => {
    selectedIds.value = [];
    selectedResources.value = [];
  };
  return { clearSelection, selectedIds, selectedResources, updateSelection };
};
