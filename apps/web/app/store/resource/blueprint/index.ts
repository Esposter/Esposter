import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

import { createEmptyBlueprint } from "@/services/resource/blueprint/createEmptyBlueprint";
import { stringifyBlueprintManifest } from "@/services/resource/blueprint/stringifyBlueprintManifest";
import { createContentData } from "@/services/resource/createContentData";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";

export const useBlueprintStore = defineStore("resource/blueprint", () => {
  const resourceStore = useResourceStore();
  const { saveContent } = resourceStore;
  // The manifest is edited wholesale as validated JSON. The text is held here, not in the Editor, so an import from
  // the overflow menu can fill it. A read replaces it with the saved manifest, so text the owner has not saved never
  // outlives the content it was typed over
  const manifestJson = ref("");
  const setManifestJson = (manifest: BlueprintResource) => {
    manifestJson.value = stringifyBlueprintManifest(manifest);
  };
  const { content: blueprint, loadContent } = createContentData<ResourceType.Blueprint>(
    ResourceType.Blueprint,
    (data) => data ?? createEmptyBlueprint(),
    setManifestJson,
  );
  const isManifestDirty = computed(() => manifestJson.value !== stringifyBlueprintManifest(blueprint.value));
  // Leaving the Editor drops unsaved text, as its navigation guard warns, so the text shown next is the saved manifest
  const discardManifest = () => {
    setManifestJson(blueprint.value);
  };
  // The store adopts the manifest only once the server has it: the Deploy dialog builds its parameter form from this
  // Ref while deploy resolves parameters from the stored manifest, so a rejected save must never leave the
  // Two disagreeing about which manifest is live
  const saveBlueprint = async (content: BlueprintResource) => {
    const isSuccessful = await saveContent(content);
    if (isSuccessful) {
      blueprint.value = content;
      setManifestJson(content);
    }
    return isSuccessful;
  };
  return { blueprint, discardManifest, isManifestDirty, loadContent, manifestJson, saveBlueprint, setManifestJson };
});
