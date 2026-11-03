<script setup lang="ts">
import type { SurveyAnswers, SurveyAnswerValue, SurveyPanelDynamicNode } from "survey-engine";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSurveyAnswerRows } from "@/services/resource/survey/getSurveyAnswerRows";
import { withSurveyAnswer } from "@/services/resource/survey/withSurveyAnswer";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyPanelDynamicNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
const panels = computed(() => getSurveyAnswerRows(answer.value, node.props.panelCount));
// A panel's record replaces the one at its place, so the answer stays a list in the order its panels are drawn
const setPanel = (panelIndex: number, panel: SurveyAnswers) => {
  answer.value = panels.value.toSpliced(panelIndex, 1, panel);
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
      <div
        role="group"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-label="label"
        flex
        flex-col
        gap-4
      >
        <div v-for="(panel, panelIndex) of panels" :key="panelIndex" ui-frame p-4 flex flex-col gap-4>
          <ResourceSurveyField
            v-for="question of node.props.template"
            :key="question.props.id"
            error=""
            :is-disabled="isDisabled"
            :model-value="panel[question.props.name]"
            :node="question"
            @update:model-value="(value) => setPanel(panelIndex, withSurveyAnswer(panel, question.props.name, value))"
          />
          <UiIconButton
            :disabled="isDisabled || panels.length <= node.props.minPanelCount"
            :label="node.props.removePanelText || 'Remove panel'"
            :meaning="UiIconMeaning.Remove"
            :variant="UiButtonVariant.Quiet"
            type="button"
            self-end
            @click="answer = panels.toSpliced(panelIndex, 1)"
          />
        </div>
        <UiButton
          :disabled="isDisabled || panels.length >= node.props.maxPanelCount"
          type="button"
          self-start
          @click="answer = [...panels, {}]"
        >
          {{ node.props.addPanelText || "Add panel" }}
        </UiButton>
      </div>
    </template>
  </ResourceSurveyFieldShell>
</template>
