<script setup lang="ts">
import type { SurveyChoice } from "survey-engine";

import { parseChoiceLine } from "@/services/resource/survey/parseChoiceLine";
import { surveyChoiceSchema } from "survey-engine";

interface Props {
  // The list's name, drawn above its rows and named by each row's group, such as "Choices" or "Rows"
  label: string;
}
// A choice's value is what an answer holds and its text is what a respondent reads, so a value is needed and unique
// Within its list. A row that breaks either is flagged and the list is not written until every row is valid
const modelValue = defineModel<SurveyChoice[]>({ required: true });
const { label } = defineProps<Props>();
const getChoiceError = (choice: SurveyChoice) =>
  String(choice.value) === ""
    ? "A choice needs a value"
    : surveyChoiceSchema.safeParse(choice).error?.issues[0]?.message;
const editor = useSurveyListEditor(modelValue, {
  duplicateMessage: "Choice values must be unique",
  getItemError: getChoiceError,
  getKey: (choice) => String(choice.value),
});
const { addItems, updateItem } = editor;
const addText = ref("");
const addFromField = () => {
  if (addText.value.trim() === "") return;

  addItems([parseChoiceLine(addText.value)]);
  addText.value = "";
};
// A paste of several lines becomes a row each, which a single-line field would otherwise join into one
const pasteLines = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData("text") ?? "";
  if (!text.includes("\n")) return;

  event.preventDefault();
  addItems(
    text
      .split(/\r?\n/u)
      .filter((line) => line.trim() !== "")
      .map((line) => parseChoiceLine(line)),
  );
};
</script>

<template>
  <ResourceSurveyCreatorListEditor :editor :label>
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
        @paste="pasteLines"
      />
    </template>
  </ResourceSurveyCreatorListEditor>
</template>
