<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswers, SurveyAnswerValue, SurveyChoice, SurveyMatrixDynamicNode } from "survey-engine";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSurveyAnswerRows } from "@/services/resource/survey/getSurveyAnswerRows";
import { withSurveyAnswer } from "@/services/resource/survey/withSurveyAnswer";
import { takeOne } from "@esposter/shared";
import { getSurveyChoiceText, SurveyMatrixCellType } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyMatrixDynamicNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const rows = computed(() => getSurveyAnswerRows(answer.value, node.props.rowCount));
// A choice is keyed by its value as text, which is how a select and a toggle group key their options
const getChoiceItems = (choices: SurveyChoice[]): UiMenuItem<string>[] =>
  choices.map((choice) => ({ title: getSurveyChoiceText(choice), value: String(choice.value) }));
// Each column's choices as the options its select and toggle group list, built once rather than for every row
const choiceItemsMap = computed(() =>
  Object.fromEntries(
    node.props.columns.map<[string, UiMenuItem<string>[]]>((column) => [column.name, getChoiceItems(column.choices)]),
  ),
);
const getCellText = (value: SurveyAnswerValue | undefined) => (typeof value === "string" ? value : "");
const getChoiceKey = (value: SurveyAnswerValue | undefined) =>
  typeof value === "number" || typeof value === "string" ? String(value) : "";
// The value a picked key stands for, so a numeric choice is still a number in the answer
const findChoiceValue = (choices: SurveyChoice[], key: string) =>
  choices.find((choice) => String(choice.value) === key)?.value;
const isChosen = (value: SurveyAnswerValue | undefined, choiceValue: SurveyChoice["value"]) =>
  Array.isArray(value) && value.includes(choiceValue);
const toggleChoice = (value: SurveyAnswerValue | undefined, choiceValue: SurveyChoice["value"], isChecked: boolean) => {
  const chosen: SurveyAnswerValue[] = Array.isArray(value) ? value : [];

  return isChecked ? [...chosen, choiceValue] : chosen.filter((item) => item !== choiceValue);
};
// A row's record replaces the one at its place, so the answer stays a list in the order its rows are drawn
const setRow = (rowIndex: number, row: SurveyAnswers) => {
  answer.value = rows.value.toSpliced(rowIndex, 1, row);
};
</script>

<template>
  <div flex flex-col gap-2>
    <div of-x-auto>
      <table text-left w-full :aria-invalid="error ? true : undefined">
        <caption text-left>
          <span block>
            {{ node.props.title || node.props.name }}
            <span v-if="node.props.isRequired" text-error>*<span sr-only> required</span></span>
          </span>
          <span v-if="node.props.description" text-sm text-muted block>{{ node.props.description }}</span>
        </caption>
        <thead>
          <tr>
            <th v-for="column of node.props.columns" :key="column.name" scope="col" text-sm text-muted p-1>
              {{ column.title || column.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) of rows" :key="rowIndex">
            <td v-for="column of node.props.columns" :key="column.name" p-1 align-top>
              <UiTextField
                v-if="column.cellType === SurveyMatrixCellType.Text"
                is-label-hidden
                :is-disabled="isDisabled || undefined"
                :label="column.title || column.name"
                :model-value="getCellText(row[column.name])"
                @update:model-value="(value) => setRow(rowIndex, withSurveyAnswer(row, column.name, value))"
              />
              <UiTextField
                v-else-if="column.cellType === SurveyMatrixCellType.Comment"
                is-label-hidden
                :is-disabled="isDisabled || undefined"
                :label="column.title || column.name"
                :model-value="getCellText(row[column.name])"
                :rows="2"
                @update:model-value="(value) => setRow(rowIndex, withSurveyAnswer(row, column.name, value))"
              />
              <UiSelect
                v-else-if="column.cellType === SurveyMatrixCellType.Dropdown"
                :is-disabled
                :items="takeOne(choiceItemsMap, column.name)"
                :label="column.title || column.name"
                :model-value="getChoiceKey(row[column.name])"
                @update:model-value="
                  (key) => setRow(rowIndex, withSurveyAnswer(row, column.name, findChoiceValue(column.choices, key)))
                "
              />
              <div v-else-if="column.cellType === SurveyMatrixCellType.Checkbox" flex flex-col gap-1>
                <UiCheckbox
                  v-for="choice of column.choices"
                  :key="String(choice.value)"
                  is-label-shown
                  :disabled="isDisabled"
                  :label="getSurveyChoiceText(choice)"
                  :model-value="isChosen(row[column.name], choice.value)"
                  @update:model-value="
                    (isChecked) =>
                      setRow(
                        rowIndex,
                        withSurveyAnswer(row, column.name, toggleChoice(row[column.name], choice.value, isChecked)),
                      )
                  "
                />
              </div>
              <UiCheckbox
                v-else-if="column.cellType === SurveyMatrixCellType.Boolean"
                :disabled="isDisabled"
                :label="column.title || column.name"
                :model-value="row[column.name] === true"
                @update:model-value="(checked) => setRow(rowIndex, withSurveyAnswer(row, column.name, checked))"
              />
              <UiToggleGroup
                v-else-if="column.cellType === SurveyMatrixCellType.Rating"
                :items="takeOne(choiceItemsMap, column.name)"
                :label="column.title || column.name"
                :model-value="getChoiceKey(row[column.name])"
                @update:model-value="
                  (key) => setRow(rowIndex, withSurveyAnswer(row, column.name, findChoiceValue(column.choices, key)))
                "
              />
            </td>
            <td p-1 align-top>
              <UiIconButton
                :disabled="isDisabled || rows.length <= node.props.minRowCount"
                :label="node.props.removeRowText || 'Remove row'"
                :meaning="UiIconMeaning.Remove"
                :variant="UiButtonVariant.Quiet"
                type="button"
                @click="answer = rows.toSpliced(rowIndex, 1)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <UiButton
      :disabled="isDisabled || rows.length >= node.props.maxRowCount"
      type="button"
      self-start
      @click="answer = [...rows, {}]"
    >
      {{ node.props.addRowText || "Add row" }}
    </UiButton>
    <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
