<script setup lang="ts">
import type { SurveyMultipleTextItem } from "vue-survey-engine-headless";

import { toSurveyMultipleTextItemFromText } from "@/services/resource/survey/toSurveyMultipleTextItemFromText";
import { SurveyMultipleTextItemInputType, surveyMultipleTextItemSchema } from "vue-survey-engine-headless";

interface Props {
  // The list's name, drawn above its rows, such as "Items"
  label: string;
}
// An item is one input of the question, held under its name, which an answer is keyed by, so a name is unique within the
// List and each item's own settings are checked by its schema
const modelValue = defineModel<SurveyMultipleTextItem[]>({ required: true });
defineProps<Props>();
const editor = useSurveyListEditor(modelValue, {
  duplicateMessage: "Item names must be unique",
  getItemError: (item) => surveyMultipleTextItemSchema.safeParse(item).error?.issues[0]?.message,
  getKey: (item) => item.name,
});
const { addItems, updateItem } = editor;
const inputTypeItems = Object.values(SurveyMultipleTextItemInputType).map((inputType) => ({
  title: inputType,
  value: inputType,
}));
const addText = ref("");
// An item added takes its typed text as its name and its title, which the owner can then change
const addFromField = () => {
  const item = toSurveyMultipleTextItemFromText(addText.value);
  if (!item) return;

  addItems([item]);
  addText.value = "";
};
</script>

<template>
  <ResourceSurveyCreatorListEditor :editor :label noun="item">
    <template #default="{ error, index, row }">
      <ResourceSurveyCreatorNameTitleFields :error :item="row.item" @update="(patch) => updateItem(row.id, patch)" />
      <UiSelect
        :items="inputTypeItems"
        :label="`Input type of item ${index + 1}`"
        :model-value="row.item.inputType"
        @update:model-value="(inputType) => updateItem(row.id, { inputType })"
      />
      <UiCheckbox
        is-label-shown
        :label="`Required, item ${index + 1}`"
        :model-value="row.item.isRequired"
        @update:model-value="(isRequired) => updateItem(row.id, { isRequired })"
      />
    </template>
    <template #add>
      <ResourceSurveyCreatorAddRowForm
        v-model="addText"
        label="Add an item"
        placeholder="Item name"
        @add="addFromField()"
      />
    </template>
  </ResourceSurveyCreatorListEditor>
</template>
