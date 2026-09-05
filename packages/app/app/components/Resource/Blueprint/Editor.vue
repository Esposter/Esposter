<script setup lang="ts">
import { blueprintResourceSchema } from "#shared/models/resource/blueprint/BlueprintResource";
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
  // eslint-disable-next-line no-restricted-syntax -- blueprintResourceSchema validates the manifest and coerces its own dates
  const parsed = getResult(() => JSON.parse(manifestJson.value) as unknown).match(
    (value) => value,
    (error) => {
      errorMessage.value = error.message;
      return undefined;
    },
  );
  if (errorMessage.value) return;

  const result = blueprintResourceSchema.safeParse(parsed);
  if (!result.success) {
    errorMessage.value = takeOne(result.error.issues, 0).message;
    return;
  }
  await saveBlueprint(result.data);
};
</script>

<template>
  <v-container fluid flex flex-col gap-4 h-full>
    <div flex flex-wrap gap-2 items-center>
      <span text-h6>Manifest</span>
      <v-spacer />
      <StyledButton :button-props="{ prependIcon: 'mdi-content-save', text: 'Save', variant: 'tonal' }" @click="save" />
      <ResourceBlueprintDeployDialog />
    </div>
    <v-alert v-if="errorMessage" type="error" variant="tonal">{{ errorMessage }}</v-alert>
    <v-textarea v-model="manifestJson" class="font-mono" flex-1 label="Manifest JSON" />
  </v-container>
</template>
