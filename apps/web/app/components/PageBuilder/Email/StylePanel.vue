<script setup lang="ts">
import { useEmailStyle } from "@/composables/pageBuilder/useEmailStyle";

interface Props {
  resourceId: string;
}
// An email node has no breakpoint or state to choose, so its style is its attribute fields alone
const { resourceId } = defineProps<Props>();
const { fields, hasNode, setField } = useEmailStyle(() => resourceId);
</script>

<template>
  <div v-if="hasNode" flex flex-col gap-3>
    <UiTextField
      v-for="field of fields"
      :key="field.name"
      :label="field.name"
      :model-value="field.value"
      :placeholder="field.placeholder"
      @update:model-value="(value) => setField(field.name, value)"
    />
  </div>
  <p v-else text-muted>Select a block to style it</p>
</template>
