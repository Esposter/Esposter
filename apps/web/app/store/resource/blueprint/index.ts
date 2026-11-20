import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

import { createEmptyBlueprint } from "#shared/services/resource/blueprint/createEmptyBlueprint";
import { stringifyBlueprintManifest } from "#src/services/resource/blueprint/stringifyBlueprintManifest";
import { createContentData } from "#src/services/resource/createContentData";
import { useResourceStore } from "#src/store/resource/index";
import { ResourceType } from "@esposter/db-schema";

export const useBlueprintStore = defineStore("resource/blueprint", () => {
  const resourceStore = useResourceStore();
  const { saveContent } = resourceStore;
  // The manifest is edited wholesale as validated JSON. The text is held here, not in the Editor, so an import from
  // The overflow menu can fill it. A read replaces it with the saved manifest, so text the owner has not saved never
  // Outlives the content it was typed over
  const manifestJson = ref("");
  const setManifestJson = (manifest: BlueprintResource) => {
    manifestJson.value = stringifyBlueprintManifest(manifest);
  };
  const { content: blueprint, loadContent } = createContentData<typeof ResourceType.Blueprint>(
    ResourceType.Blueprint,
    (data) => data ?? createEmptyBlueprint(),
    setManifestJson,
  );
  const isManifestDirty = computed(() => manifestJson.value !== stringifyBlueprintManifest(blueprint.value));
  // Leaving the Editor drops unsaved text, as its navigation guard warns, so the text shown next is the saved manifest
  const discardManifest = () => {
    setManifestJson(blueprint.value);
  };
  // The store adopts the manifest at once, so the Deploy dialog's parameter form shows the manifest being saved
  const saveBlueprint = (content: BlueprintResource) => {
    blueprint.value = content;
    setManifestJson(content);
    saveContent(content);
  };
  return { blueprint, discardManifest, isManifestDirty, loadContent, manifestJson, saveBlueprint, setManifestJson };
});
