<script setup lang="ts">
import type { SurveyAnswerValue, SurveyChoice, SurveyMatrixNode } from "survey-engine";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyMatrixNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const id = useId();
const label = computed(() => node.props.title || node.props.name);
const descriptionId = `${id}-description`;
const errorId = `${id}-error`;
// The answer is a record from each row's value to the value of the column chosen in it, read as the empty record until one is given
const answers = computed<Record<string, SurveyAnswerValue>>(() =>
  typeof answer.value === "object" && !Array.isArray(answer.value) ? answer.value : {},
);
const getChoiceText = ({ text, value }: SurveyChoice) => text || String(value);
// Each column is keyed by its place in the question, since two values may read alike and a radio group keys its options by text
const columnItems = computed(() =>
  node.props.columns.map((column, index) => ({ title: getChoiceText(column), value: String(index) })),
);
const describedBy = computed(
  () => [node.props.description && descriptionId, error && errorId].filter(Boolean).join(" ") || undefined,
);
const getColumnKey = (row: SurveyChoice) => {
  const index = node.props.columns.findIndex(({ value }) => value === answers.value[String(row.value)]);
  return index === -1 ? undefined : String(index);
};
const updateRow = (row: SurveyChoice, columnKey: string) => {
  const column = node.props.columns[Number(columnKey)];
  if (column === undefined) return;
  answer.value = { ...answers.value, [String(row.value)]: column.value };
};
</script>

<template>
  <div
    role="group"
    :aria-describedby="describedBy"
    :aria-invalid="error ? true : undefined"
    :aria-label="label"
    flex
    flex-col
    gap-2
  >
    <span text-sm text-muted
      >{{ label }}<span v-if="node.props.isRequired" aria-hidden="true" text-error> *</span></span
    >
    <span v-if="node.props.description" :id="descriptionId" text-sm text-muted>{{ node.props.description }}</span>
    <!-- One row of the table per row choice, its radio group choosing one column of that row -->
    <table w-full>
      <tbody>
        <tr v-for="row of node.props.rows" :key="row.value">
          <th scope="row" text-start font-normal align-top pr-4>{{ getChoiceText(row) }}</th>
          <td>
            <UiRadioGroup
              :is-disabled="isDisabled"
              :items="columnItems"
              :label="getChoiceText(row)"
              :model-value="getColumnKey(row)"
              @update:model-value="(columnKey) => updateRow(row, columnKey)"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <span v-if="error" :id="errorId" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
