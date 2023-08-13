<script setup lang="ts">
import { useSurveyStore } from "@/store/surveyer/survey";
import type { VCombobox } from "vuetify/components";

interface GroupAutocompleteProps {
  autocompleteProps?: VCombobox["$props"];
}

const modelValue = defineModel<string | null>();
const { autocompleteProps } = defineProps<GroupAutocompleteProps>();
const surveyerStore = useSurveyStore();
const { surveyList } = storeToRefs(surveyerStore);
const groups = computed(() => {
  const results = new Set<string>();
  for (const { group } of surveyList.value) if (group) results.add(group);
  return [...results];
});
</script>

<template>
  <v-combobox v-model="modelValue" label="Group" :items="groups" :="autocompleteProps" />
</template>
