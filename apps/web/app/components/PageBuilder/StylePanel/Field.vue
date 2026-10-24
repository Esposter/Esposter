<script setup lang="ts">
import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";

import { getStyleValueError } from "@/services/pageBuilder/getStyleValueError";

interface Props {
  label: string;
  // The value the field inherits when it sets none, shown in its place, such as "from Desktop"
  placeholder?: string;
  // The property the value sets, which the browser checks the value against as it is typed
  property: StyleProperty;
}

// The saved value. A draft the check refuses stays in the field, unsaved, and the saved value is left as it was
const modelValue = defineModel<string>({ required: true });
const { label, placeholder, property } = defineProps<Props>();
const draft = ref(modelValue.value);
const rules = [(value: string) => getStyleValueError(property, value) ?? true];

watch(modelValue, (value) => {
  draft.value = value;
});
watch(draft, (value) => {
  if (getStyleValueError(property, value) === undefined) modelValue.value = value;
});
</script>

<template>
  <UiTextField v-model="draft" :label :placeholder :rules />
</template>
