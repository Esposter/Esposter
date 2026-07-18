import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

import { getRouteParamString } from "@/util/router/getRouteParamString";

const createEmptyBlueprint = (): BlueprintResource => ({ entries: [], parameters: [] });

export const useBlueprintStore = defineStore("resource/blueprint", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save } = useResource(() => getRouteParamString(route.params.id));
  const blueprint = ref<BlueprintResource>(createEmptyBlueprint());
  const loadContent = async () => {
    await load();
    const content = await readContent();
    blueprint.value = (content as BlueprintResource | undefined) ?? createEmptyBlueprint();
  };
  // The manifest is edited wholesale as validated JSON, so the save takes the parsed manifest and persists it
  const saveBlueprint = (content: BlueprintResource) => {
    blueprint.value = content;
    return save(content);
  };
  return { blueprint, loadContent, resource, saveBlueprint };
});
