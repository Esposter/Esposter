<script setup lang="ts">
import type { SurveyChoice } from "survey-engine";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
const { addItems, announcement, errors, moveItem, onRowKeydown, removeItem, rows, updateItem } = useSurveyListEditor(
  modelValue,
  {
    duplicateMessage: "Choice values must be unique",
    getItemError: getChoiceError,
    getKey: (choice) => String(choice.value),
  },
);
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
  <div flex flex-col gap-2>
    <span text-sm text-muted>{{ label }}</span>
    <div
      v-for="(row, index) of rows"
      :key="row.id"
      :aria-label="`${label} ${index + 1}`"
      role="group"
      flex
      gap-2
      items-start
      @keydown="(event) => onRowKeydown(event, row.id)"
    >
      <UiTextField
        :error="errors[index]"
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
      <UiIconButton
        :disabled="index === 0"
        :label="`Move row ${index + 1} up`"
        :meaning="UiIconMeaning.ArrowUp"
        :variant="UiButtonVariant.Quiet"
        @click="moveItem(row.id, index - 1)"
      />
      <UiIconButton
        :disabled="index === rows.length - 1"
        :label="`Move row ${index + 1} down`"
        :meaning="UiIconMeaning.ArrowDown"
        :variant="UiButtonVariant.Quiet"
        @click="moveItem(row.id, index + 1)"
      />
      <UiIconButton
        :label="`Remove row ${index + 1}`"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="removeItem(row.id)"
      />
    </div>
    <div aria-live="polite" sr-only>{{ announcement }}</div>
    <UiForm flex gap-2 items-start @submit="addFromField()">
      <UiTextField
        v-model="addText"
        is-label-hidden
        label="Add a choice"
        placeholder="Value or value|text"
        @paste="(event: ClipboardEvent) => pasteLines(event)"
      />
      <UiButton :disabled="addText.trim() === ''" type="submit" :variant="UiButtonVariant.Quiet">Add</UiButton>
    </UiForm>
  </div>
</template>
