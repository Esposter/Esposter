<script setup lang="ts">
import type { VCombobox } from "vuetify/components";

import { useSurveyStore } from "@/store/survey";

interface GroupComboboxProps {
  comboboxProps?: VCombobox["$props"];
}

const modelValue = defineModel<null | string>();
const { comboboxProps } = defineProps<GroupComboboxProps>();
const surveyStore = useSurveyStore();
const { items } = storeToRefs(surveyStore);
const groups = computed(() => {
  const groups = new Set<string>();
  for (const { group } of items.value) if (group) groups.add(group);
  return [...groups];
});
</script>

<template>
  <v-combobox v-model="modelValue" label="Group" :items="groups" :="comboboxProps" />
</template>
