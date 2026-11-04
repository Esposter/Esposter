<script setup lang="ts">
import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyPanelDynamicNode,
  SurveyPanelRowView,
  SurveyTemplateNode,
} from "survey-engine";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSurveyAnswerRows } from "@/services/resource/survey/getSurveyAnswerRows";
import { withSurveyAnswer } from "@/services/resource/survey/withSurveyAnswer";

interface Props {
  error: string;
  // The runner's views of the template questions a row shows, read against the survey's values and the row's own answers
  getRowViews?: (node: SurveyPanelDynamicNode, row: SurveyAnswers) => SurveyPanelRowView[];
  isDisabled: boolean;
  node: SurveyPanelDynamicNode;
  // What the panel's shuffled choices are ordered by, the session's seed, passed on to each question of the panel
  seed: string;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, getRowViews, isDisabled, node, seed } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
const panels = computed(() => getSurveyAnswerRows(answer.value, node.props.panelCount));
// Outside a runner, as on the Creator's canvas, no condition decides a row, so every template question is drawn with its own flags
const getTemplateViews = (panel: SurveyAnswers): SurveyPanelRowView[] =>
  getRowViews
    ? getRowViews(node, panel)
    : node.props.template.map((question) => ({
        isEnabled: true,
        isRequired: "isRequired" in question.props && question.props.isRequired,
        node: question,
      }));
// A field marks the required flag of its own node, so a row hands its field the node carrying the flag its row decides
const withRowRequired = <T extends SurveyTemplateNode>(question: T, isRequired: boolean): T => ({
  ...question,
  props: { ...question.props, isRequired },
});
// Each panel with the template questions its row shows, each drawn with the flags the row decides
const rows = computed(() =>
  panels.value.map((panel) => ({
    fields: getTemplateViews(panel).map((view) => ({
      isDisabled: isDisabled || !view.isEnabled,
      node: withRowRequired(view.node, view.isRequired),
    })),
    panel,
  })),
);
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
        <div v-for="(row, panelIndex) of rows" :key="panelIndex" p-4 flex flex-col gap-4 ui-frame>
          <ResourceSurveyField
            v-for="field of row.fields"
            :key="field.node.props.id"
            error=""
            :is-disabled="field.isDisabled"
            :model-value="row.panel[field.node.props.name]"
            :node="field.node"
            :seed
            @update:model-value="
              (value) => setPanel(panelIndex, withSurveyAnswer(row.panel, field.node.props.name, value))
            "
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
