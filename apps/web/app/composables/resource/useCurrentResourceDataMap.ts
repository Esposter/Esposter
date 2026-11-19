import { useResourceStore } from "#src/store/resource/index";

// The keyed state of the open resource: a field of a store or a component is keyed by the resource it was written under.
// That key is the open resource's id, owned here rather than restated beside every field
export const useCurrentResourceDataMap = <TItem>(defaultValue: (() => TItem) | TItem) => {
  const resourceStore = useResourceStore();
  return useDataMap(() => resourceStore.currentResourceId, defaultValue);
};
