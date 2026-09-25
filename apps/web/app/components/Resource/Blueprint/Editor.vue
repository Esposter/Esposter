<script setup lang="ts">
import { blueprintResourceSchema } from "#shared/models/resource/blueprint/BlueprintResource";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useBlueprintStore } from "@/store/resource/blueprint";
import { getResult, takeOne } from "@esposter/shared";

const blueprintStore = useBlueprintStore();
const { loadContent, saveBlueprint } = blueprintStore;
const { blueprint } = storeToRefs(blueprintStore);
await loadContent();
// The manifest is edited as schema-validated JSON — the escape hatch, since capture is the primary
// Authoring path. A local clone follows the store's content and carries the user's edits until save
const { cloned: manifestJson } = useCloned(() => JSON.stringify(blueprint.value, null, 2));
const errorMessage = ref("");
const save = async () => {
  errorMessage.value = "";
  // oxlint-disable-next-line no-restricted-properties -- blueprintResourceSchema validates the manifest and coerces its own dates
  const parsedManifest = getResult(() => JSON.parse(manifestJson.value) as unknown)
    .orTee((error) => {
      errorMessage.value = error.message;
    })
    .unwrapOr(undefined);
  if (errorMessage.value) return;

  const parsedBlueprint = blueprintResourceSchema.safeParse(parsedManifest);
  if (!parsedBlueprint.success) {
    errorMessage.value = takeOne(parsedBlueprint.error.issues, 0).message;
    return;
  }
  await saveBlueprint(parsedBlueprint.data);
};
</script>

<template>
  <div p-4 flex flex-col gap-4 h-full ui-body>
    <!-- The heading yields its width and the two actions keep theirs, so the row never wraps -->
    <div flex gap-2 items-center>
      <h2 flex-1 min-w-0 truncate ui-heading>Manifest</h2>
      <UiButton :variant="UiButtonVariant.Accent" @click="save()">
        <UiIcon :meaning="UiIconMeaning.Save" />
        Save
      </UiButton>
      <ResourceBlueprintDeployDialog />
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
