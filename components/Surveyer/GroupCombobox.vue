<script setup lang="ts">
import { useSurveyerStore } from "@/store/surveyer";
import type { VCombobox } from "vuetify/components";

interface GroupAutocompleteProps {
  autocompleteProps?: VCombobox["$props"];
}

const modelValue = defineModel<string | null>();
const { autocompleteProps } = defineProps<GroupAutocompleteProps>();
const surveyerStore = useSurveyerStore();
const { surveyerConfiguration } = storeToRefs(surveyerStore);
const groups = computed(() => {
  if (!surveyerConfiguration.value) return [];

  const results = new Set<string>();
  for (const { group } of surveyerConfiguration.value) if (group) results.add(group);
  return [...results];
});
</script>

<template>
  <v-combobox v-model="modelValue" label="Group" :items="groups" :="autocompleteProps" />
</template>
