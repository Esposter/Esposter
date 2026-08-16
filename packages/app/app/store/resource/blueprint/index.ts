import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";
import type { ResourceType } from "@esposter/db-schema";

import { createContentData } from "@/services/resource/createContentData";
import { useResourceStore } from "@/store/resource";

const createEmptyBlueprint = (): BlueprintResource => ({ entries: [], parameters: [] });

export const useBlueprintStore = defineStore("resource/blueprint", () => {
  const resourceStore = useResourceStore();
  const { saveContent } = resourceStore;
  const { content: blueprint, loadContent } = createContentData<ResourceType.Blueprint>(
    (data) => data ?? createEmptyBlueprint(),
  );
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
