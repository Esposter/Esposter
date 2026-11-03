<script setup lang="ts">
import type { SurveyAnswerValue, SurveyChoice, SurveyMatrixNode } from "survey-engine";

import { getSurveyChoiceText } from "survey-engine";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyMatrixNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
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
  <ResourceSurveyFieldShell
    :description="node.props.description"
    :error
    :is-required="node.props.isRequired"
    :title="label"
  >
    <template #default="{ describedBy }">
      <div role="group" :aria-describedby="describedBy" :aria-invalid="error ? true : undefined" :aria-label="label">
        <!-- One row of the table per row choice, its radio group choosing one column of that row -->
        <table w-full>
          <tbody>
            <tr v-for="row of node.props.rows" :key="row.value">
              <th scope="row" text-start font-normal align-top pr-4>{{ getSurveyChoiceText(row) }}</th>
              <td>
                <UiRadioGroup
                  :is-disabled="isDisabled"
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
    </template>
  </ResourceSurveyFieldShell>
</template>
