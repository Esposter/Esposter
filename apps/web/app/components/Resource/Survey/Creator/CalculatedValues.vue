<script setup lang="ts">
import type { SurveyEditDraft } from "@/models/resource/survey/SurveyEditDraft";
import type { SurveyCalculatedValue } from "survey-engine";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import {
  SURVEY_CALCULATED_VALUE_EXPRESSION,
  SURVEY_CALCULATED_VALUE_NAME_REQUIRED_MESSAGE,
  SURVEY_REFUSED_MESSAGE,
} from "@/services/resource/survey/constants";
import { getActiveSurveyEditDraft } from "@/services/resource/survey/getActiveSurveyEditDraft";
import { getNewCalculatedValueName } from "@/services/resource/survey/getNewCalculatedValueName";
import { getSurveyCalculatedValueIssue } from "@/services/resource/survey/getSurveyCalculatedValueIssue";
import { getSurveyConditionAnswers } from "@/services/resource/survey/getSurveyConditionAnswers";
import { getSurveyExpressionFault } from "@/services/resource/survey/getSurveyExpressionFault";
import { checkIsBlankSource } from "@/services/shared/checkIsBlankSource";
import { useSurveyCreatorStore } from "@/store/survey/creator";

const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { updateRootProps } = useSurveyCreatorCommands();
const calculatedValues = computed(() => surveyDocument.value.root.props.calculatedValues);
// Drafts are held by the index of the value they were typed into, and a removal clears them, since it shifts the indices
const nameDrafts = reactive(new Map<number, SurveyEditDraft>());
const expressionDrafts = reactive(new Map<number, SurveyEditDraft>());
const getText = (drafts: Map<number, SurveyEditDraft>, index: number, savedText: string): string =>
  getActiveSurveyEditDraft(drafts.get(index), savedText)?.text ?? savedText;
const getFault = (drafts: Map<number, SurveyEditDraft>, index: number, savedText: string): string | undefined =>
  getActiveSurveyEditDraft(drafts.get(index), savedText)?.fault;
// Each value is copied into a plain object, so what is written holds no reactive proxy of the store's
const getValues = (): SurveyCalculatedValue[] =>
  calculatedValues.value.map((calculatedValue) => ({ ...calculatedValue }));
const withValue = (index: number, change: Partial<SurveyCalculatedValue>): SurveyCalculatedValue[] =>
  getValues().map((calculatedValue, valueIndex) =>
    valueIndex === index ? { ...calculatedValue, ...change } : calculatedValue,
  );
// A text the check refuses stays in its field as a draft beside its message, and the saved list is left as it was
const holdOrWrite = (
  drafts: Map<number, SurveyEditDraft>,
  index: number,
  savedText: string,
  text: string,
  fault: string | undefined,
  values: SurveyCalculatedValue[],
): void => {
  if (fault === undefined && updateRootProps({ calculatedValues: values })) {
    drafts.delete(index);
    return;
  }

  drafts.set(index, { base: savedText, fault: fault ?? SURVEY_REFUSED_MESSAGE, text });
};
const setName = (index: number, newName: string): void => {
  const savedName = calculatedValues.value[index]?.name ?? "";
  const values = withValue(index, { name: newName });
  const fault = checkIsBlankSource(newName)
    ? SURVEY_CALCULATED_VALUE_NAME_REQUIRED_MESSAGE
    : getSurveyCalculatedValueIssue(surveyDocument.value, values, index);
  holdOrWrite(nameDrafts, index, savedName, newName, fault, values);
};
const setExpression = (index: number, newExpression: string): void => {
  const savedExpression = calculatedValues.value[index]?.expression ?? "";
  const values = withValue(index, { expression: newExpression });
  holdOrWrite(expressionDrafts, index, savedExpression, newExpression, getSurveyExpressionFault(newExpression), values);
};
const setIncludeIntoResult = (index: number, newIncludeIntoResult: boolean): void => {
  updateRootProps({ calculatedValues: withValue(index, { includeIntoResult: newIncludeIntoResult }) });
};
const addValue = (): void => {
  const newName = getNewCalculatedValueName(getSurveyConditionAnswers(surveyDocument.value).map(({ name }) => name));
  updateRootProps({
    calculatedValues: [
      ...getValues(),
      { expression: SURVEY_CALCULATED_VALUE_EXPRESSION, includeIntoResult: false, name: newName },
    ],
  });
};
const removeValue = (index: number): void => {
  updateRootProps({ calculatedValues: getValues().toSpliced(index, 1) });
  nameDrafts.clear();
  expressionDrafts.clear();
};
</script>

<template>
  <div flex flex-col gap-6>
    <section v-for="(calculatedValue, index) of calculatedValues" :key="index" flex flex-col gap-3>
      <UiTextField
        :model-value="getText(nameDrafts, index, calculatedValue.name)"
        label="Name"
        :error="getFault(nameDrafts, index, calculatedValue.name)"
        @update:model-value="(newName) => setName(index, newName)"
      />
      <UiTextField
        :model-value="getText(expressionDrafts, index, calculatedValue.expression)"
        label="Expression"
        :error="getFault(expressionDrafts, index, calculatedValue.expression)"
        @update:model-value="(newExpression) => setExpression(index, newExpression)"
      />
      <div flex flex-wrap gap-2 items-center>
        <UiSwitch
          :model-value="calculatedValue.includeIntoResult"
          label="Include into result"
          is-label-shown
          @update:model-value="(newIncludeIntoResult) => setIncludeIntoResult(index, newIncludeIntoResult)"
        />
        <UiIconButton label="Remove calculated value" :meaning="UiIconMeaning.Remove" @click="removeValue(index)" />
      </div>
    </section>
    <UiButton @click="addValue()">Add a calculated value</UiButton>
  </div>
</template>
