<script setup lang="ts">
import type { EmailStyleField } from "@/models/pageBuilder/EmailStyleField";

import { MjmlAttributeKind } from "mjml-blocks";

interface Props {
  field: EmailStyleField;
}

const { field } = defineProps<Props>();
const emit = defineEmits<{ reset: []; update: [value: string] }>();
// The control shows what the node sets, or the cascade's value until it sets one
const shownValue = computed(() => (field.isSet ? field.value : field.placeholder));
// An enum's choices are its options, each chosen as its own value
const enumItems = computed(() =>
  field.type.kind === MjmlAttributeKind.Enum
    ? field.type.options.map((option) => ({ title: option, value: option }))
    : [],
);
</script>

<!-- One control per attribute kind, each writing its value as the string MJML reads. Reset clears what the node sets -->
<template>
  <div flex flex-col gap-2>
    <UiSelect
      v-if="field.type.kind === MjmlAttributeKind.Enum"
      :items="enumItems"
      :label="field.name"
      :model-value="shownValue"
      @update:model-value="(value) => emit('update', value)"
    />
    <UiColorField
      v-else-if="field.type.kind === MjmlAttributeKind.Color"
      :label="field.name"
      :model-value="shownValue"
      @update:model-value="(value) => emit('update', value)"
    />
    <UiSwitch
      v-else-if="field.type.kind === MjmlAttributeKind.Boolean"
      is-label-shown
      :label="field.name"
      :model-value="shownValue === 'true'"
      @update:model-value="(value) => emit('update', String(value))"
    />
    <UiTextField
      v-else
      :label="field.name"
      :model-value="field.value"
      :placeholder="field.placeholder"
      @update:model-value="(value) => emit('update', value)"
    />
    <UiButton v-if="field.isSet" :aria-label="`Reset ${field.name}`" @click="emit('reset')">Reset</UiButton>
  </div>
</template>
