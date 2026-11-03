<script setup lang="ts">
import type { SurveyConditionProp } from "@/models/resource/survey/SurveyConditionProp";
import type { SurveyConditionRow } from "@/models/resource/survey/SurveyConditionRow";
import type { SurveyEditDraft } from "@/models/resource/survey/SurveyEditDraft";

import { SurveyConditionJoin } from "@/models/resource/survey/SurveyConditionJoin";
import { SurveyConditionOperator } from "@/models/resource/survey/SurveyConditionOperator";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { buildSurveyCondition } from "@/services/resource/survey/buildSurveyCondition";
import {
  SURVEY_BOOLEAN_VALUE_ITEMS,
  SURVEY_CONDITION_ADVANCED_MESSAGE,
  SURVEY_CONDITION_JOIN_ITEMS,
  SURVEY_CONDITION_OPERATOR_TITLES,
  SURVEY_CONDITION_SECTIONS,
  SURVEY_REFUSED_MESSAGE,
} from "@/services/resource/survey/constants";
import { getActiveSurveyEditDraft } from "@/services/resource/survey/getActiveSurveyEditDraft";
import { getSurveyConditionAnswers } from "@/services/resource/survey/getSurveyConditionAnswers";
import { getSurveyConditionOperators } from "@/services/resource/survey/getSurveyConditionOperators";
import { getSurveyExpressionFault } from "@/services/resource/survey/getSurveyExpressionFault";
import { parseSurveyConditionRows } from "@/services/resource/survey/parseSurveyConditionRows";
import { toSurveyConditionInputValue } from "@/services/resource/survey/toSurveyConditionInputValue";
import { checkIsBlankSource } from "@/services/shared/checkIsBlankSource";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { SurveyNodeType } from "survey-engine";

const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, selectedNode, selectedPointer } = storeToRefs(surveyCreatorStore);
const { updateNodeProps } = useSurveyCreatorCommands();
// The conditions the selected node holds, each the text it saves under its prop, so a prop the node lacks is no condition of it
const conditions = computed<Partial<Record<SurveyConditionProp, string>>>(() => selectedNode.value?.props ?? {});
const sections = computed(() => SURVEY_CONDITION_SECTIONS.filter(({ prop }) => Object.hasOwn(conditions.value, prop)));
const answers = computed(() => getSurveyConditionAnswers(surveyDocument.value));
const answerItems = computed(() =>
  answers.value.map(({ name, title }) => ({
    description: title !== "" && title !== name ? name : undefined,
    title: title || name,
    value: name,
  })),
);
// A text the check refused is held per condition, beside the saved text it was typed over
const drafts = reactive(new Map<SurveyConditionProp, SurveyEditDraft>());
const getSavedText = (prop: SurveyConditionProp): string => conditions.value[prop] ?? "";
const getDraft = (prop: SurveyConditionProp) => getActiveSurveyEditDraft(drafts.get(prop), getSavedText(prop));
const getText = (prop: SurveyConditionProp): string => getDraft(prop)?.text ?? getSavedText(prop);
const getFault = (prop: SurveyConditionProp): string | undefined => getDraft(prop)?.fault;
// A condition is written only while its text checks, and an empty one holds always. A text that does not check, or that
// The store refuses, stays in its field as a draft, so the saved condition is left as it was
const writeCondition = (prop: SurveyConditionProp, text: string): void => {
  const fault = checkIsBlankSource(text) ? undefined : getSurveyExpressionFault(text);
  if (fault === undefined && updateNodeProps(selectedPointer.value, { [prop]: text })) {
    drafts.delete(prop);
    return;
  }

  drafts.set(prop, { base: getSavedText(prop), fault: fault ?? SURVEY_REFUSED_MESSAGE, text });
};
const getRows = (prop: SurveyConditionProp) => parseSurveyConditionRows(getSavedText(prop));
// A row is rebuilt into the condition's text from the rows its saved text reads, so the text stays the one source
const editRow = (prop: SurveyConditionProp, index: number, change: Partial<SurveyConditionRow>): void => {
  const parsedRows = getRows(prop);
  if (parsedRows === undefined) return;

  const rows = parsedRows.rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...change } : row));
  writeCondition(prop, buildSurveyCondition(rows, parsedRows.join));
};
const editValue = (prop: SurveyConditionProp, index: number, text: string): void => {
  editRow(prop, index, { value: toSurveyConditionInputValue(text) });
};
const addRow = (prop: SurveyConditionProp): void => {
  const parsedRows = getRows(prop);
  if (parsedRows === undefined) return;

  const questionName = answers.value[0]?.name ?? "";
  const rows = [...parsedRows.rows, { operator: SurveyConditionOperator.Equals, questionName, value: "" }];
  writeCondition(prop, buildSurveyCondition(rows, parsedRows.join));
};
const removeRow = (prop: SurveyConditionProp, index: number): void => {
  const parsedRows = getRows(prop);
  if (parsedRows === undefined) return;

  const rows = parsedRows.rows.filter((_row, rowIndex) => rowIndex !== index);
  writeCondition(prop, buildSurveyCondition(rows, parsedRows.join));
};
const editJoin = (prop: SurveyConditionProp, join: SurveyConditionJoin): void => {
  const parsedRows = getRows(prop);
  if (parsedRows === undefined) return;

  writeCondition(prop, buildSurveyCondition(parsedRows.rows, join));
};
const getAnswerType = (questionName: string): SurveyNodeType | undefined =>
  answers.value.find(({ name }) => name === questionName)?.type;
const checkIsBooleanAnswer = (questionName: string): boolean => getAnswerType(questionName) === SurveyNodeType.Boolean;
const checkTakesValue = (operator: SurveyConditionOperator): boolean =>
  ![SurveyConditionOperator.Empty, SurveyConditionOperator.NotEmpty].includes(operator);
const getOperatorItems = (questionName: string) =>
  getSurveyConditionOperators(getAnswerType(questionName)).map((operator) => ({
    title: SURVEY_CONDITION_OPERATOR_TITLES[operator],
    value: operator,
  }));
</script>

<template>
  <div :key="selectedPointer" flex flex-col gap-6>
    <p v-if="selectedNode === undefined" text-muted>Select an element to set its conditions.</p>
    <section v-for="{ label, prop } of sections" :key="prop" flex flex-col gap-3>
      <h3 ui-title>{{ label }}</h3>
      <div v-if="getRows(prop)" flex flex-col gap-3>
        <div v-for="(row, index) of getRows(prop)?.rows" :key="index" flex flex-wrap gap-2 items-end>
          <UiSelect
            :items="answerItems"
            label="Question"
            :model-value="row.questionName"
            @update:model-value="(newQuestionName) => editRow(prop, index, { questionName: newQuestionName })"
          />
          <UiSelect
            :items="getOperatorItems(row.questionName)"
            label="Operator"
            :model-value="row.operator"
            @update:model-value="(newOperator) => editRow(prop, index, { operator: newOperator })"
          />
          <template v-if="checkTakesValue(row.operator)">
            <UiSelect
              v-if="checkIsBooleanAnswer(row.questionName)"
              :items="SURVEY_BOOLEAN_VALUE_ITEMS"
              label="Value"
              :model-value="String(row.value)"
              @update:model-value="(newValue) => editRow(prop, index, { value: newValue === 'true' })"
            />
            <UiTextField
              v-else
              :model-value="String(row.value)"
              label="Value"
              @update:model-value="(newValue) => editValue(prop, index, newValue)"
            />
          </template>
          <UiIconButton label="Remove condition" :meaning="UiIconMeaning.Remove" @click="removeRow(prop, index)" />
        </div>
        <UiToggleGroup
          v-if="(getRows(prop)?.rows.length ?? 0) > 1"
          :items="SURVEY_CONDITION_JOIN_ITEMS"
          label="Join"
          :model-value="getRows(prop)?.join ?? SurveyConditionJoin.And"
          @update:model-value="(newJoin) => editJoin(prop, newJoin)"
        />
        <UiButton :disabled="answers.length === 0" @click="addRow(prop)">Add a condition</UiButton>
      </div>
      <p v-else text-muted>{{ SURVEY_CONDITION_ADVANCED_MESSAGE }}</p>
      <UiTextField
        :model-value="getText(prop)"
        label="Expression"
        :error="getFault(prop)"
        @update:model-value="(newText) => writeCondition(prop, newText)"
      />
    </section>
  </div>
</template>
