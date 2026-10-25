<script setup lang="ts">
import { ResourceSaveState } from "@/models/resource/ResourceSaveState";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { parseBlueprintManifest } from "@/services/resource/blueprint/parseBlueprintManifest";
import { useResourceStore } from "@/store/resource";
import { useBlueprintStore } from "@/store/resource/blueprint";
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
const save = async () => {
  errorMessage.value = "";
  const parsedManifest = getResult(() => parseBlueprintManifest(manifestJson.value))
    .orTee((error) => {
      errorMessage.value = error.message;
    })
    .unwrapOr(undefined);
  if (!parsedManifest) return;

  await saveBlueprint(parsedManifest);
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
