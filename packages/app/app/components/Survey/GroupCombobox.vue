<script setup lang="ts">
import type { VCombobox } from "vuetify/components";

import { useSurveyStore } from "@/store/survey";

interface GroupComboboxProps {
  comboboxProps?: VCombobox["$props"];
}

const modelValue = defineModel<null | string>();
const { comboboxProps } = defineProps<GroupComboboxProps>();
const surveyStore = useSurveyStore();
const { surveys } = storeToRefs(surveyStore);
const groups = computed(() => {
  const results = new Set<string>();
  for (const { group } of surveys.value) if (group) results.add(group);
  return [...results];
});
</script>

<template>
  <v-combobox v-model="modelValue" label="Group" :items="groups" :="comboboxProps" />
</template>
