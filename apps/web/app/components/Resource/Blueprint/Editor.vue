<script setup lang="ts">
import { blueprintResourceSchema } from "#shared/models/resource/blueprint/BlueprintResource";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
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
  const parsedManifest = getResult(() => JSON.parse(manifestJson.value) as unknown).match(
    (value) => value,
    (error) => {
      errorMessage.value = error.message;
      return undefined;
    },
  );
  if (errorMessage.value) return;

  const result = blueprintResourceSchema.safeParse(parsedManifest);
  if (!result.success) {
    errorMessage.value = takeOne(result.error.issues, 0).message;
    return;
  }
  await saveBlueprint(result.data);
};
</script>

<template>
  <div p-4 flex flex-col gap-4 h-full ui-body>
    <div flex flex-wrap gap-2 items-center>
      <h2 ui-heading>Manifest</h2>
      <UiButton :variant="UiButtonVariant.Accent" ml-a flex @click="save">
        <span class="i-mdi:content-save" aria-hidden="true" size-5 />
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
