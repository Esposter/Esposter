<script setup lang="ts">
import type { SurveyMultipleTextItem } from "survey-engine";

import { toSurveyMultipleTextItemFromText } from "@/services/resource/survey/toSurveyMultipleTextItemFromText";
import { SurveyMultipleTextItemInputType, surveyMultipleTextItemSchema } from "survey-engine";

interface Props {
  // The list's name, drawn above its rows and named by each row's group, such as "Items"
  label: string;
}
// An item is one input of the question, held under its name, which an answer is keyed by, so a name is unique within the
// List and each item's own settings are checked by its schema
const modelValue = defineModel<SurveyMultipleTextItem[]>({ required: true });
const { label } = defineProps<Props>();
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
  const items = toSurveyMultipleTextItemFromText(addText.value);
  if (items.length === 0) return;

  addItems(items);
  addText.value = "";
};
</script>

<template>
  <ResourceSurveyCreatorListEditor :editor :label>
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
