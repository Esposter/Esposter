<script setup lang="ts">
import { ResourceSaveState } from "#src/models/resource/ResourceSaveState";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { parseBlueprintManifest } from "#src/services/resource/blueprint/parseBlueprintManifest";
import { useBlueprintStore } from "#src/store/resource/blueprint/index";
import { useResourceStore } from "#src/store/resource/index";
import { getResult } from "@esposter/shared";

const blueprintStore = useBlueprintStore();
const { discardManifest, loadContent, saveBlueprint } = blueprintStore;
const { isManifestDirty, manifestJson } = storeToRefs(blueprintStore);
const resourceStore = useResourceStore();
const { saveState } = storeToRefs(resourceStore);
const isSaving = computed(() => saveState.value === ResourceSaveState.Saving);
await loadContent();
// The manifest saves on Save alone, unlike the editors that autosave, so text not yet saved is guarded on the way out
// And kept from Deploy, which always runs the saved manifest
useConfirmBeforeNavigation(isManifestDirty);
onUnmounted(discardManifest);
const errorMessage = ref("");
const save = () => {
  errorMessage.value = "";
  const parsedManifest = getResult(() => parseBlueprintManifest(manifestJson.value))
    .orTee((error) => {
      errorMessage.value = error.message;
    })
    .unwrapOr(undefined);
  if (!parsedManifest) return;

  saveBlueprint(parsedManifest);
};
</script>

<template>
  <div p-4 flex flex-col gap-4 h-full ui-body>
    <!-- The heading yields its width and the two actions keep theirs, so the row never wraps -->
    <div flex gap-2 items-center>
      <h2 flex-1 min-w-0 truncate ui-heading>Manifest</h2>
      <UiButton :is-pending="isSaving" :variant="UiButtonVariant.Accent" @click="save()">
        <UiIcon v-if="!isSaving" :meaning="UiIconMeaning.Save" />
        Save
      </UiButton>
      <ResourceBlueprintDeployDialog :is-disabled="isManifestDirty ? true : undefined" />
    </div>
    <UiAlert v-if="errorMessage" status="error">{{ errorMessage }}</UiAlert>
    <UiTextField v-model="manifestJson" class="manifest" label="Manifest JSON" :rows="20" flex-1 />
  </div>
</template>

<style scoped>
/* The manifest is code, so it keeps the mono face whatever the body reads in */
.manifest :deep(textarea) {
  font-family: var(--ui-font-mono);
}
</style>
