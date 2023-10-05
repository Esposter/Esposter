<script setup lang="ts">
import { useSurveyStore } from "@/store/surveyer/survey";
import type { VAutocomplete } from "vuetify/components";

interface GroupAutocompleteProps {
  autocompleteProps?: VAutocomplete["$props"];
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
  <v-autocomplete v-model="modelValue" label="Group" :items="groups" :="autocompleteProps" />
</template>
