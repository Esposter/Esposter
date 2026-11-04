<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyChoice,
  SurveyMatrixColumn,
  SurveyMatrixDynamicNode,
} from "survey-engine";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSurveyAnswerRows } from "@/services/resource/survey/getSurveyAnswerRows";
import { getSurveyQuestionTitle } from "@/services/resource/survey/getSurveyQuestionTitle";
import { getSurveyRatingItems } from "@/services/resource/survey/getSurveyRatingItems";
import { withSurveyAnswer } from "@/services/resource/survey/withSurveyAnswer";
import { takeOne } from "@esposter/shared";
import { getSurveyChoiceText, MATRIX_CELL_RATING_COUNT, SurveyMatrixCellType } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyMatrixDynamicNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const errorId = useId();
// A column's header names the cells that take no aria-required, so a required column's word reaches speech through it
const headerId = useId();
const getHeaderId = (columnIndex: number) => `${headerId}-${columnIndex}`;
// The table holds no invalid state of its own, since a table takes no aria-invalid, so each control in it carries it
const invalid = computed(() => (error ? true : undefined));
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
// A rating cell's steps are the numbers of its scale, since its column carries no choices to draw them from
const ratingItems = getSurveyRatingItems(MATRIX_CELL_RATING_COUNT);
const getCellText = (value: SurveyAnswerValue | undefined) => (typeof value === "string" ? value : "");
// A rating cell holds its step as a number, and an empty cell holds the empty text no step has as its value
const getRatingValue = (value: SurveyAnswerValue | undefined): number | string =>
  typeof value === "number" ? value : "";
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
// A dropdown cell chooses from its column's choices, and the choice a key picks is written as that choice's own value
const getChoiceCellAttributes = (column: SurveyMatrixColumn, row: SurveyAnswers, rowIndex: number) => ({
  "aria-invalid": invalid.value,
  "aria-required": column.isRequired ? true : undefined,
  isDisabled: isDisabled || undefined,
  items: takeOne(choiceItemsMap.value, column.name),
  label: column.title || column.name,
  modelValue: getChoiceKey(row[column.name]),
  "onUpdate:modelValue": (key: string) =>
    setRow(rowIndex, withSurveyAnswer(row, column.name, findChoiceValue(column.choices, key))),
});
</script>

<template>
  <div flex flex-col gap-2>
    <div of-x-auto>
      <table text-left w-full :aria-describedby="error ? errorId : undefined">
        <caption text-left>
          <span block>
            {{ getSurveyQuestionTitle(node.props) }}
            <UiRequiredMark v-if="node.props.isRequired" />
          </span>
          <span v-if="node.props.description" text-sm text-muted block>{{ node.props.description }}</span>
        </caption>
        <thead>
          <tr>
            <!-- A required column is marked here; its text, comment and dropdown cells say so through aria-required -->
            <th
              v-for="(column, columnIndex) of node.props.columns"
              :id="getHeaderId(columnIndex)"
              :key="column.name"
              scope="col"
              text-sm
              text-muted
              p-1
            >
              {{ column.title || column.name }}
              <UiRequiredMark v-if="column.isRequired" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) of rows" :key="rowIndex">
            <td v-for="(column, columnIndex) of node.props.columns" :key="column.name" p-1 align-top>
              <UiTextField
                v-if="column.cellType === SurveyMatrixCellType.Text"
                is-label-hidden
                :is-disabled="isDisabled || undefined"
                :is-invalid="invalid"
                :is-required="column.isRequired || undefined"
                :label="column.title || column.name"
                :model-value="getCellText(row[column.name])"
                @update:model-value="(value) => setRow(rowIndex, withSurveyAnswer(row, column.name, value))"
              />
              <UiTextField
                v-else-if="column.cellType === SurveyMatrixCellType.Comment"
                is-label-hidden
                :is-disabled="isDisabled || undefined"
                :is-invalid="invalid"
                :is-required="column.isRequired || undefined"
                :label="column.title || column.name"
                :model-value="getCellText(row[column.name])"
                :rows="2"
                @update:model-value="(value) => setRow(rowIndex, withSurveyAnswer(row, column.name, value))"
              />
              <UiSelect
                v-else-if="column.cellType === SurveyMatrixCellType.Dropdown"
                :="getChoiceCellAttributes(column, row, rowIndex)"
              />
              <div
                v-else-if="column.cellType === SurveyMatrixCellType.Checkbox"
                :aria-labelledby="getHeaderId(columnIndex)"
                role="group"
                flex
                flex-col
                gap-1
              >
                <UiCheckbox
                  v-for="choice of column.choices"
                  :key="String(choice.value)"
                  :aria-invalid="invalid"
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
                :aria-invalid="invalid"
                :aria-labelledby="getHeaderId(columnIndex)"
                :disabled="isDisabled"
                :label="column.title || column.name"
                :model-value="row[column.name] === true"
                @update:model-value="(checked) => setRow(rowIndex, withSurveyAnswer(row, column.name, checked))"
              />
              <UiToggleGroup
                v-else-if="column.cellType === SurveyMatrixCellType.Rating"
                :aria-invalid="invalid"
                :aria-labelledby="getHeaderId(columnIndex)"
                :is-disabled="isDisabled || undefined"
                :items="ratingItems"
                :label="column.title || column.name"
                :model-value="getRatingValue(row[column.name])"
                @update:model-value="(step) => setRow(rowIndex, withSurveyAnswer(row, column.name, step))"
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
    <span v-if="error" :id="errorId" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
