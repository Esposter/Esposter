import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

import { createEmptyBlueprint } from "#src/services/resource/blueprint/createEmptyBlueprint";
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
  // The store adopts the manifest at once, so the Deploy dialog's parameter form shows the manifest being saved.
  // Deploy resolves parameters from the stored manifest, so a refused save puts back the blueprint it replaced, unless a
  // Later save has adopted another manifest since, which that save's own outcome owns. The manifest text goes back too,
  // But only while it is still the text this save wrote: anything typed since is the reader's
  const saveBlueprint = (content: BlueprintResource) => {
    const previousBlueprint = blueprint.value;
    const previousManifestJson = manifestJson.value;
    blueprint.value = content;
    setManifestJson(content);
    const writtenBlueprint = blueprint.value;
    const writtenManifestJson = manifestJson.value;
    saveContent(content, () => {
      if (blueprint.value !== writtenBlueprint) return;

      blueprint.value = previousBlueprint;
      if (manifestJson.value === writtenManifestJson) manifestJson.value = previousManifestJson;
    });
  };
  return { blueprint, discardManifest, isManifestDirty, loadContent, manifestJson, saveBlueprint, setManifestJson };
});
