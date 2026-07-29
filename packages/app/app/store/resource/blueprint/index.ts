import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

import { getRouteParamString } from "@/util/router/getRouteParamString";

const createEmptyBlueprint = (): BlueprintResource => ({ entries: [], parameters: [] });

export const useBlueprintStore = defineStore("resource/blueprint", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save, setPersistedContent } = useResource(() =>
    getRouteParamString(route.params.id),
  );
  const blueprint = ref<BlueprintResource>(createEmptyBlueprint());
  const loadContent = async () => {
    await load();
    const content = await readContent();
    blueprint.value = (content as BlueprintResource | undefined) ?? createEmptyBlueprint();
    // Seed the dirty check so an unedited Save compares equal instead of bumping contentVersion for nothing
    setPersistedContent(blueprint.value);
  };
  // The manifest is edited wholesale as validated JSON, so the save takes the parsed manifest and persists it.
  // The store adopts it only once the server has it: the Deploy dialog builds its parameter form from this
  // Ref while deploy resolves parameters from the stored manifest, so a rejected save must never leave the
  // Two disagreeing about which manifest is live
  const saveBlueprint = async (content: BlueprintResource) => {
    const isSuccessful = await save(content);
    if (isSuccessful) blueprint.value = content;
    return isSuccessful;
  };
  return { blueprint, loadContent, resource, saveBlueprint };
});
