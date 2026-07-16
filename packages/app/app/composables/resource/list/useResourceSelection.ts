import type { Resource } from "@esposter/db-schema";

// Vuetify's selection model only carries ids, so full rows are remembered here — bulk delete/export can then list names across page boundaries
export const useResourceSelection = <TResource extends Pick<Resource, "id">>(items: Ref<TResource[]>) => {
  const selectedResources = shallowRef<TResource[]>([]);
  // Derived from the rows so the ids and the remembered rows can never diverge
  const selectedIds = computed(() => selectedResources.value.map(({ id }) => id));
  const updateSelection = (ids: string[]) => {
    // Current page rows win over remembered snapshots so a renamed/updated selection never shows stale data
    const itemMap = new Map(items.value.map((item) => [item.id, item]));
    const selectedResourceMap = new Map(selectedResources.value.map((resource) => [resource.id, resource]));
    selectedResources.value = ids.flatMap((id) => {
      const resource = itemMap.get(id) ?? selectedResourceMap.get(id);
      return resource ? [resource] : [];
    });
  };
  const clearSelection = () => {
    selectedResources.value = [];
  };
  return { clearSelection, selectedIds, selectedResources, updateSelection };
};
