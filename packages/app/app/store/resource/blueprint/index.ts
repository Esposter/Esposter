import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";
import type { ResourceType } from "@esposter/db-schema";

import { useResourceStore } from "@/store/resource";

const createEmptyBlueprint = (): BlueprintResource => ({ entries: [], parameters: [] });

export const useBlueprintStore = defineStore("resource/blueprint", () => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent, setPersistedContent } = resourceStore;
  const blueprint = ref<BlueprintResource>(createEmptyBlueprint());
  const loadContent = async () => {
    await readResource();
    const content = await readContent<ResourceType.Blueprint>();
    blueprint.value = content ?? createEmptyBlueprint();
    // Seed the dirty check so an unedited Save compares equal instead of bumping contentVersion for nothing
    setPersistedContent(blueprint.value);
  };
  // The manifest is edited wholesale as validated JSON, so the save takes the parsed manifest and persists it.
  // The store adopts it only once the server has it: the Deploy dialog builds its parameter form from this
  // Ref while deploy resolves parameters from the stored manifest, so a rejected save must never leave the
  // Two disagreeing about which manifest is live
  const saveBlueprint = async (content: BlueprintResource) => {
    const isSuccessful = await saveContent(content);
    if (isSuccessful) blueprint.value = content;
    return isSuccessful;
  };
  return { blueprint, loadContent, saveBlueprint };
});
