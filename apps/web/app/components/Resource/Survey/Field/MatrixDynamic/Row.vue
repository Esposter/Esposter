<script setup lang="ts">
import type { UiMenuItem } from "#src/models/ui/UiMenuItem";
import type { SurveyAnswers, SurveyAnswerValue, SurveyChoice, SurveyMatrixColumn } from "vue-survey-engine-headless";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getSurveyAnswerText } from "#src/services/resource/survey/getSurveyAnswerText";
import { getSurveyQuestionTitle } from "#src/services/resource/survey/getSurveyQuestionTitle";
import { getSurveyRatingItems } from "#src/services/resource/survey/getSurveyRatingItems";
import { getSurveyRatingStep } from "#src/services/resource/survey/getSurveyRatingStep";
import { withSurveyAnswer } from "#src/services/resource/survey/withSurveyAnswer";
import { takeOne } from "@esposter/shared";
import {
  getSurveyChoiceText,
  MATRIX_CELL_RATING_COUNT,
  MATRIX_CELL_RATING_MIN,
  SurveyMatrixCellType,
} from "vue-survey-engine-headless";

interface Props {
  // Each column's choices as the options its select and toggle group list, built by the matrix once for every row
  choiceItemsMap: Record<string, UiMenuItem<string>[]>;
  columns: SurveyMatrixColumn[];
  getHeaderId: (columnIndex: number) => string;
  invalid?: true | undefined;
  isDisabled: boolean;
  isRemoveDisabled: boolean;
  removeLabel: string;
  row: SurveyAnswers;
}

const { choiceItemsMap, invalid, isDisabled, row } = defineProps<Props>();
const emit = defineEmits<{ remove: []; update: [row: SurveyAnswers] }>();
// A rating cell's steps are the numbers of its scale, since its column carries no choices to draw them from
const ratingItems = getSurveyRatingItems(MATRIX_CELL_RATING_MIN, MATRIX_CELL_RATING_COUNT);
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
// A dropdown cell chooses from its column's choices, and the choice a key picks is written as that choice's own value
const getChoiceCellAttributes = (column: SurveyMatrixColumn) => ({
  "aria-invalid": invalid,
  "aria-required": column.isRequired ? true : undefined,
  isDisabled: isDisabled || undefined,
  items: takeOne(choiceItemsMap, column.name),
  label: getSurveyQuestionTitle(column),
  modelValue: getChoiceKey(row[column.name]),
  "onUpdate:modelValue": (key: string) =>
    emit("update", withSurveyAnswer(row, column.name, findChoiceValue(column.choices, key))),
});
</script>

<template>
  <tr>
    <td v-for="(column, columnIndex) of columns" :key="column.name" p-1 align-top>
      <UiTextField
        v-if="column.cellType === SurveyMatrixCellType.Text || column.cellType === SurveyMatrixCellType.Comment"
        is-label-hidden
        :is-disabled="isDisabled || undefined"
        :is-invalid="invalid"
        :is-required="column.isRequired || undefined"
        :label="getSurveyQuestionTitle(column)"
        :model-value="getSurveyAnswerText(row[column.name])"
        :rows="column.cellType === SurveyMatrixCellType.Comment ? 2 : undefined"
        @update:model-value="(value) => emit('update', withSurveyAnswer(row, column.name, value))"
      />
      <UiSelect v-else-if="column.cellType === SurveyMatrixCellType.Dropdown" :="getChoiceCellAttributes(column)" />
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
          is-label-visible
          :disabled="isDisabled"
          :label="getSurveyChoiceText(choice)"
          :model-value="isChosen(row[column.name], choice.value)"
          @update:model-value="
            (newModelValue) =>
              emit(
                'update',
                withSurveyAnswer(row, column.name, toggleChoice(row[column.name], choice.value, newModelValue)),
              )
          "
        />
      </div>
      <UiCheckbox
        v-else-if="column.cellType === SurveyMatrixCellType.Boolean"
        :aria-invalid="invalid"
        :aria-labelledby="getHeaderId(columnIndex)"
        :disabled="isDisabled"
        :label="getSurveyQuestionTitle(column)"
        :model-value="row[column.name] === true"
        @update:model-value="(checked) => emit('update', withSurveyAnswer(row, column.name, checked))"
      />
      <UiToggleGroup
        v-else-if="column.cellType === SurveyMatrixCellType.Rating"
        :aria-invalid="invalid"
        :aria-labelledby="getHeaderId(columnIndex)"
        :is-disabled="isDisabled || undefined"
        :items="ratingItems"
        :label="getSurveyQuestionTitle(column)"
        :model-value="getSurveyRatingStep(row[column.name])"
        @update:model-value="(step) => emit('update', withSurveyAnswer(row, column.name, step))"
      />
    </td>
    <td p-1 align-top>
      <UiIconButton
        :disabled="isRemoveDisabled"
        :label="removeLabel"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        type="button"
        @click="emit('remove')"
      />
    </td>
  </tr>
</template>
