<script setup lang="ts">
import type { SurveyMultipleTextItem } from "survey-engine";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { surveyMultipleTextItemSchema, SurveyMultipleTextItemInputType } from "survey-engine";

interface Props {
  // The list's name, drawn above its rows and named by each row's group, such as "Items"
  label: string;
}
// An item is one input of the question, held under its name, which an answer is keyed by, so a name is unique within the
// List and each item's own settings are checked by its schema
const modelValue = defineModel<SurveyMultipleTextItem[]>({ required: true });
const { label } = defineProps<Props>();
const { addItems, announcement, errors, moveItem, onRowKeydown, removeItem, rows, updateItem } = useSurveyListEditor(
  modelValue,
  {
    duplicateMessage: "Item names must be unique",
    getItemError: (item) => surveyMultipleTextItemSchema.safeParse(item).error?.issues[0]?.message,
    getKey: (item) => item.name,
  },
);
const inputTypeItems = Object.values(SurveyMultipleTextItemInputType).map((inputType) => ({
  title: inputType,
  value: inputType,
}));
const addText = ref("");
// An item added takes its typed text as its name and its title, which the owner can then change
const addFromField = () => {
  if (addText.value.trim() === "") return;

  addItems([
    {
      inputType: SurveyMultipleTextItemInputType.Text,
      isRequired: false,
      name: addText.value.trim(),
      title: addText.value.trim(),
    },
  ]);
  addText.value = "";
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
        label="Name"
        :model-value="row.item.name"
        @update:model-value="(name) => updateItem(row.id, { name })"
      />
      <UiTextField
        label="Title"
        :model-value="row.item.title"
        @update:model-value="(title) => updateItem(row.id, { title })"
      />
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
      <UiTextField v-model="addText" is-label-hidden label="Add an item" placeholder="Item name" />
      <UiButton :disabled="addText.trim() === ''" type="submit" :variant="UiButtonVariant.Quiet">Add</UiButton>
    </UiForm>
  </div>
</template>
