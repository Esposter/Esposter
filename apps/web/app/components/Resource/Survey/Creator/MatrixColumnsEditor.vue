<script setup lang="ts">
import type { SurveyMatrixColumn } from "survey-engine";

import { SurveyMatrixCellType, surveyMatrixColumnSchema } from "survey-engine";

interface Props {
  // The list's name, drawn above its rows and named by each row's group, such as "Columns"
  label: string;
}
// A column is told apart by its name, since an answer is keyed by it, and each column's own settings are checked by its
// Schema. A column whose cell takes choices holds its list beneath it, drawn by the choice list editor
const modelValue = defineModel<SurveyMatrixColumn[]>({ required: true });
const { label } = defineProps<Props>();
const editor = useSurveyListEditor(modelValue, {
  duplicateMessage: "Column names must be unique",
  getItemError: (column) => surveyMatrixColumnSchema.safeParse(column).error?.issues[0]?.message,
  getKey: (column) => column.name,
});
const { addItems, updateItem } = editor;
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
  <ResourceSurveyCreatorListEditor :editor :label>
    <template #default="{ error, index, row }">
      <ResourceSurveyCreatorNameTitleFields :error :item="row.item" @update="(patch) => updateItem(row.id, patch)" />
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
    </template>
    <template #below="{ row }">
      <ResourceSurveyCreatorChoiceListEditor
        v-if="isChoiceCellType(row.item.cellType)"
        label="Choices"
        :model-value="row.item.choices"
        @update:model-value="(choices) => updateItem(row.id, { choices })"
      />
    </template>
    <template #add>
      <ResourceSurveyCreatorAddRowForm
        v-model="addText"
        label="Add a column"
        placeholder="Column title"
        @add="addFromField()"
      />
    </template>
  </ResourceSurveyCreatorListEditor>
</template>
