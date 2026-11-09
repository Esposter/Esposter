<script setup lang="ts">
import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyPanelDynamicNode,
  SurveyPanelRowView,
} from "vue-survey-engine-headless";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSurveyAnswerRows } from "@/services/resource/survey/getSurveyAnswerRows";
import { withSurveyAnswer } from "@/services/resource/survey/withSurveyAnswer";
import { withSurveyRequired } from "@/services/resource/survey/withSurveyRequired";
import { takeOne } from "@esposter/shared";

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
const { getRowViews, isDisabled, node } = defineProps<Props>();
const panels = computed(() => getSurveyAnswerRows(answer.value, node.props.panelCount));
// A panel's key names its row for as long as the row stands, so a row that stays keeps the state its fields hold while the
// Rows before it are removed. An answer has no id to read a key from, so each is minted here
let lastPanelKey = 0;
const createPanelKeys = (count: number) =>
  Array.from({ length: count }, () => {
    lastPanelKey += 1;
    return lastPanelKey;
  });
const panelKeys = ref(createPanelKeys(panels.value.length));
// A panel added or removed here takes its key with it, so only a count that moved from outside the component is keyed afresh
watch(
  () => panels.value.length,
  (count) => {
    if (panelKeys.value.length !== count) panelKeys.value = createPanelKeys(count);
  },
);
// Outside a runner, as on the Creator's canvas, no condition decides a row, so every template question is drawn with its own flags
const getTemplateViews = (panel: SurveyAnswers): SurveyPanelRowView[] =>
  getRowViews
    ? getRowViews(node, panel)
    : node.props.template.map((question) => ({
        isEnabled: true,
        isRequired: "isRequired" in question.props && question.props.isRequired,
        node: question,
      }));
// Each panel with the template questions its row shows, each drawn with the flags the row decides, and the key its row keeps
const rows = computed(() =>
  panels.value.map((panel, index) => ({
    fields: getTemplateViews(panel).map((view) => ({
      isDisabled: isDisabled || !view.isEnabled,
      node: withSurveyRequired(view.node, view.isRequired),
    })),
    key: takeOne(panelKeys.value, index),
    panel,
  })),
);
// A panel's record replaces the one at its place, so the answer stays a list in the order its panels are drawn
const setPanel = (panelIndex: number, panel: SurveyAnswers) => {
  answer.value = panels.value.toSpliced(panelIndex, 1, panel);
};
// A panel removed or added takes its key with it, so the rows that stay keep the state their fields hold
const removePanel = (panelIndex: number) => {
  answer.value = panels.value.toSpliced(panelIndex, 1);
  panelKeys.value = panelKeys.value.toSpliced(panelIndex, 1);
};
const addPanel = () => {
  answer.value = [...panels.value, {}];
  panelKeys.value = [...panelKeys.value, ...createPanelKeys(1)];
};
</script>

<template>
  <ResourceSurveyFieldShell :error :question="node.props">
    <!-- A group takes neither aria-invalid nor aria-required, so it is named by its title, which carries the required word,
    And described by the error, the one message the shell draws for the panel, since a row's controls would each repeat it -->
    <template #default="{ describedBy, labelledBy }">
      <div role="group" :aria-describedby="describedBy" :aria-labelledby="labelledBy" flex flex-col gap-4>
        <div v-for="(row, panelIndex) of rows" :key="row.key" p-4 flex flex-col gap-4 ui-frame>
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
          <!-- eslint-disable vue/no-restricted-syntax -- removes a panel from the unsaved answer draft, which nothing persists until the survey is submitted -->
          <UiIconButton
            :disabled="isDisabled || panels.length <= node.props.minPanelCount"
            :label="node.props.removePanelText || 'Remove panel'"
            :meaning="UiIconMeaning.Remove"
            :variant="UiButtonVariant.Quiet"
            type="button"
            self-end
            @click="removePanel(panelIndex)"
          />
          <!-- eslint-enable vue/no-restricted-syntax -->
        </div>
        <UiButton
          :disabled="isDisabled || panels.length >= node.props.maxPanelCount"
          type="button"
          self-start
          @click="addPanel()"
        >
          {{ node.props.addPanelText || "Add panel" }}
        </UiButton>
      </div>
    </template>
  </ResourceSurveyFieldShell>
</template>
