<script setup lang="ts">
import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyElementView,
  SurveyPanelDynamicNode,
  SurveyPanelRowView,
} from "survey-engine";

import { withSurveyRequired } from "@/services/resource/survey/withSurveyRequired";
import { SurveyNodeType } from "survey-engine";

interface Props {
  answers: SurveyAnswers;
  errorByPointer: (pointer: string) => string;
  // The runner's view of a dynamic panel's template questions for one row, passed down to the field of each panel
  getRowViews: (node: SurveyPanelDynamicNode, row: SurveyAnswers) => SurveyPanelRowView[];
  isDisabled: boolean;
  questionNumbers: Map<string, number>;
  // What the shuffled choices are ordered by, the session's seed, passed down to every element of the page
  seed: string;
  view: SurveyElementView;
}

const { answers, errorByPointer, getRowViews, isDisabled, questionNumbers, seed, view } = defineProps<Props>();
const emit = defineEmits<{ answer: [name: string, value: SurveyAnswerValue | undefined] }>();
// Only a question answers under its name, so a page's html and image elements have no answer to hold
const answer = computed(() => ("name" in view.node.props ? answers[view.node.props.name] : undefined));
// A field's answer is written under the question's name, which only a question's props carry
const updateAnswer = (value: SurveyAnswerValue | undefined) => {
  if ("name" in view.node.props) emit("answer", view.node.props.name, value);
};
// The question as its field draws it, with the required flag the runner decides, so its mark follows its requiring condition. A panel draws no field
const fieldNode = computed(() =>
  view.node.type === SurveyNodeType.Panel ? undefined : withSurveyRequired(view.node, view.isRequired),
);
</script>

<template>
  <fieldset v-if="view.node.type === SurveyNodeType.Panel" :data-pointer="view.pointer" flex flex-col gap-3 min-w-0>
    <legend v-if="view.node.props.title" ui-title>{{ view.node.props.title }}</legend>
    <p v-if="view.node.props.description" text-muted>{{ view.node.props.description }}</p>
    <ResourceSurveyRunnerElement
      v-for="child of view.children"
      :key="child.pointer"
      :answers
      :error-by-pointer
      :get-row-views
      :is-disabled="isDisabled || !view.isEnabled"
      :question-numbers
      :seed
      :view="child"
      @answer="(name, value) => emit('answer', name, value)"
    />
  </fieldset>
  <div v-else-if="fieldNode" :data-pointer="view.pointer" flex gap-2 items-start>
    <span v-if="questionNumbers.get(view.pointer)" text-muted shrink-0>{{ questionNumbers.get(view.pointer) }}.</span>
    <div flex-1 min-w-0>
      <ResourceSurveyField
        :error="errorByPointer(view.pointer)"
        :get-row-views
        :is-disabled="isDisabled || !view.isEnabled"
        :model-value="answer"
        :node="fieldNode"
        :seed
        @update:model-value="(value) => updateAnswer(value)"
      />
    </div>
  </div>
</template>
