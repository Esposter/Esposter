<script setup lang="ts">
import type { BlueprintParameter } from "#shared/models/resource/blueprint/BlueprintParameter";

interface Props {
  parameter: BlueprintParameter;
}

const modelValue = defineModel<string>({ required: true });
const { parameter } = defineProps<Props>();
// A parameter with allowed values is a choice, which its field offers as those values and takes no other
const choiceItems = computed(() => (parameter.allowedValues ?? []).map((value) => ({ title: value, value })));
</script>

<template>
  <div flex flex-col gap-1>
    <UiSelect
      v-if="parameter.allowedValues"
      v-model="modelValue"
      :items="choiceItems"
      :label="parameter.title || parameter.key"
    />
    <UiTextField v-else v-model="modelValue" :label="parameter.title || parameter.key" />
    <p v-if="parameter.description" text-muted>{{ parameter.description }}</p>
  </div>
</template>
