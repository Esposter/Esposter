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
const groups = computed(() => (surveyerConfiguration.value ? surveyerConfiguration.value.map((s) => s.group) : []));
</script>

<template>
  <v-combobox v-model="modelValue" label="Group" :items="groups" :="autocompleteProps" />
</template>
