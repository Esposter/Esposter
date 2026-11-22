<script setup lang="ts">
import type { UiMenuItem } from "#src/models/ui/UiMenuItem";
import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyChoice,
  SurveyMatrixDynamicNode,
} from "vue-survey-engine-headless";

import { getSurveyAnswerRows } from "#src/services/resource/survey/getSurveyAnswerRows";
import { getSurveyQuestionTitle } from "#src/services/resource/survey/getSurveyQuestionTitle";
import { getSurveyChoiceText } from "vue-survey-engine-headless";

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
// A row's record replaces the one at its place, so the answer stays a list in the order its rows are drawn
const setRow = (rowIndex: number, row: SurveyAnswers) => {
  answer.value = rows.value.toSpliced(rowIndex, 1, row);
};
const removeRow = (rowIndex: number) => {
  answer.value = rows.value.toSpliced(rowIndex, 1);
};
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
              <UiFieldLabel :is-required="column.isRequired || undefined" :label="column.title || column.name" />
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- eslint-disable vue/no-restricted-syntax -- removes a row from the unsaved answer draft, which nothing persists until the survey is submitted -->
          <ResourceSurveyFieldMatrixDynamicRow
            v-for="(row, rowIndex) of rows"
            :key="rowIndex"
            :choice-items-map
            :columns="node.props.columns"
            :get-header-id
            :invalid
            :is-disabled="isDisabled"
            :is-remove-disabled="isDisabled || rows.length <= node.props.minRowCount"
            :remove-label="node.props.removeRowText || 'Remove row'"
            :row
            @remove="removeRow(rowIndex)"
            @update="(newRow) => setRow(rowIndex, newRow)"
          />
          <!-- eslint-enable vue/no-restricted-syntax -->
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
