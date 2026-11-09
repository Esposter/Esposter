<script setup lang="ts">
import type { SurveyChoice } from "vue-survey-engine-headless";

import { getSurveyChoiceListEditorOptions } from "@/services/resource/survey/getSurveyChoiceListEditorOptions";
import { parseChoiceLines } from "@/services/resource/survey/parseChoiceLines";
import { surveyChoiceSchema } from "vue-survey-engine-headless";

interface Props {
  // The list's name, drawn above its rows, such as "Choices" or "Rows"
  label: string;
}
// A choice's value is what an answer holds and its text is what a respondent reads, so a value is needed and unique
// Within its list. A row that breaks either is flagged and the list is not written until every row is valid
const modelValue = defineModel<SurveyChoice[]>({ required: true });
defineProps<Props>();
const editor = useSurveyListEditor(modelValue, getSurveyChoiceListEditorOptions(surveyChoiceSchema));
const { addItems, updateItem } = editor;
const addText = ref("");
const addFromField = () => {
  const choices = parseChoiceLines(addText.value);
  if (choices.length === 0) return;

  addItems(choices);
  addText.value = "";
};
// A paste of several lines becomes a row each, which a single-line field would otherwise join into one
const pasteLines = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData("text") ?? "";
  if (!text.includes("\n")) return;

  event.preventDefault();
  addItems(parseChoiceLines(text));
};
</script>

<template>
  <ResourceSurveyCreatorListEditor :editor :label noun="choice">
    <template #default="{ error, row }">
      <UiTextField
        :error
        is-label-hidden
        label="Value"
        :model-value="String(row.item.value)"
        placeholder="Value"
        @update:model-value="(value) => updateItem(row.id, { value })"
      />
      <UiTextField
        is-label-hidden
        label="Text"
        :model-value="row.item.text"
        placeholder="Text"
        @update:model-value="(text) => updateItem(row.id, { text })"
      />
    </template>
    <template #add>
      <ResourceSurveyCreatorAddRowForm
        v-model="addText"
        label="Add a choice"
        placeholder="Value or value|text"
        @add="addFromField()"
        @paste="(event) => pasteLines(event)"
      />
    </template>
  </ResourceSurveyCreatorListEditor>
</template>
