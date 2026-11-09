<script setup lang="ts">
import type { SurveyAnswerValue, SurveyChoice, SurveyMatrixNode } from "vue-survey-engine-headless";

import { getSurveyChoiceText } from "vue-survey-engine-headless";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyMatrixNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
// The answer is a record from each row's value to the value of the column chosen in it, read as the empty record until one is given
const answers = useSurveyRecordAnswer(answer);
// Each column is keyed by its place in the question, since two values may read alike and a radio group keys its options by text
const columnItems = computed(() =>
  node.props.columns.map((column, index) => ({ title: getSurveyChoiceText(column), value: String(index) })),
);
const getColumnKey = (row: SurveyChoice) => {
  const index = node.props.columns.findIndex(({ value }) => value === answers.value[String(row.value)]);
  return index === -1 ? undefined : String(index);
};
const updateRow = (row: SurveyChoice, columnKey: string | undefined) => {
  if (columnKey === undefined) return;
  const column = node.props.columns[Number(columnKey)];
  if (column === undefined) return;
  answer.value = { ...answers.value, [String(row.value)]: column.value };
};
</script>

<template>
  <ResourceSurveyFieldShell :error :question="node.props">
    <template #default="{ describedBy, labelledBy }">
      <div role="group" :aria-describedby="describedBy" :aria-labelledby="labelledBy">
        <!-- One row of the table per row choice, its radio group choosing one column of that row. A table wider than the
          field scrolls in its own wrapper, as the dynamic matrix's does -->
        <div of-x-auto>
          <table w-full>
            <tbody>
              <tr v-for="row of node.props.rows" :key="row.value">
                <th scope="row" fw-normal pr-4 text-start align-top>{{ getSurveyChoiceText(row) }}</th>
                <td>
                  <UiRadioGroup
                    :aria-invalid="error ? true : undefined"
                    :aria-required="node.props.isAllRowRequired ? true : undefined"
                    :is-disabled
                    :items="columnItems"
                    :label="getSurveyChoiceText(row)"
                    :model-value="getColumnKey(row)"
                    @update:model-value="(columnKey) => updateRow(row, columnKey)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </ResourceSurveyFieldShell>
</template>
