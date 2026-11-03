<script setup lang="ts">
import type { SurveyMatrixColumn } from "survey-engine";

import { surveyMatrixColumnSchema, SurveyMatrixCellType } from "survey-engine";

interface Props {
  // The list's name, drawn above its rows and named by each row's group, such as "Columns"
  label: string;
}
// A column is told apart by its name, since an answer is keyed by it, and each column's own settings are checked by its
// Schema. A column whose cell takes choices holds its list beneath it, drawn by the choice list editor
const modelValue = defineModel<SurveyMatrixColumn[]>({ required: true });
const { label } = defineProps<Props>();
const { addItems, announcement, errors, moveItem, onRowKeydown, removeItem, rows, updateItem } = useSurveyListEditor(
  modelValue,
  {
    duplicateMessage: "Column names must be unique",
    getItemError: (column) => surveyMatrixColumnSchema.safeParse(column).error?.issues[0]?.message,
    getKey: (column) => column.name,
  },
);
const cellTypeItems = Object.values(SurveyMatrixCellType).map((cellType) => ({ title: cellType, value: cellType }));
const addText = ref("");
// A column added takes its title as its name, so it is refused where the name is not valid or repeats another's
const addFromField = () => {
  if (addText.value.trim() === "") return;

  addItems([
    {
      cellType: SurveyMatrixCellType.Text,
      choices: [],
      isRequired: false,
      name: addText.value.trim(),
      title: addText.value.trim(),
    },
  ]);
  addText.value = "";
};
const isChoiceCellType = (cellType: SurveyMatrixCellType) =>
  cellType === SurveyMatrixCellType.Checkbox || cellType === SurveyMatrixCellType.Dropdown;
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
      flex-col
      gap-2
      @keydown="(event) => onRowKeydown(event, row.id)"
    >
      <div flex gap-2 items-start>
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
          :items="cellTypeItems"
          :label="`Cell type of column ${index + 1}`"
          :model-value="row.item.cellType"
          @update:model-value="(cellType) => updateItem(row.id, { cellType })"
        />
        <UiCheckbox
          is-label-shown
          :label="`Required, column ${index + 1}`"
          :model-value="row.item.isRequired"
          @update:model-value="(isRequired) => updateItem(row.id, { isRequired })"
        />
        <ResourceSurveyCreatorRowActions
          :index
          :count="rows.length"
          @move="(toIndex) => moveItem(row.id, toIndex)"
          @remove="removeItem(row.id)"
        />
      </div>
      <ResourceSurveyCreatorChoiceListEditor
        v-if="isChoiceCellType(row.item.cellType)"
        label="Choices"
        :model-value="row.item.choices"
        @update:model-value="(choices) => updateItem(row.id, { choices })"
      />
    </div>
    <div aria-live="polite" sr-only>{{ announcement }}</div>
    <ResourceSurveyCreatorAddRowForm
      v-model="addText"
      label="Add a column"
      placeholder="Column title"
      @add="addFromField()"
    />
  </div>
</template>
