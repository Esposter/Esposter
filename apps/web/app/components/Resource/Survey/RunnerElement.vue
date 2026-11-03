<script setup lang="ts">
import type { SurveyAnswers, SurveyAnswerValue, SurveyElementView } from "survey-engine";

import { SurveyNodeType } from "survey-engine";

interface Props {
  answers: SurveyAnswers;
  errorByPointer: (pointer: string) => string;
  isDisabled: boolean;
  questionNumbers: Map<string, number>;
  view: SurveyElementView;
}

const { answers, errorByPointer, isDisabled, questionNumbers, view } = defineProps<Props>();
const emit = defineEmits<{ answer: [name: string, value: SurveyAnswerValue | undefined] }>();
// Only a question answers under its name, so a page's html and image elements have no answer to hold
const answer = computed(() => ("name" in view.node.props ? answers[view.node.props.name] : undefined));
// A field's answer is written under the question's name, which only a question's props carry
const updateAnswer = (value: SurveyAnswerValue | undefined) => {
  if ("name" in view.node.props) emit("answer", view.node.props.name, value);
};
</script>

<template>
  <fieldset v-if="view.node.type === SurveyNodeType.Panel" :data-pointer="view.pointer" min-w-0 flex flex-col gap-3>
    <legend v-if="view.node.props.title" ui-title>{{ view.node.props.title }}</legend>
    <p v-if="view.node.props.description" text-muted>{{ view.node.props.description }}</p>
    <ResourceSurveyRunnerElement
      v-for="child of view.children"
      :key="child.pointer"
      :answers
      :error-by-pointer="errorByPointer"
      :is-disabled="isDisabled || !view.isEnabled"
      :question-numbers="questionNumbers"
      :view="child"
      @answer="(name, value) => emit('answer', name, value)"
    />
  </fieldset>
  <div v-else :data-pointer="view.pointer" flex gap-2 items-start>
    <span v-if="questionNumbers.get(view.pointer)" shrink-0 text-muted>{{ questionNumbers.get(view.pointer) }}.</span>
    <div min-w-0 flex-1>
      <ResourceSurveyField
        :error="errorByPointer(view.pointer)"
        :is-disabled="isDisabled || !view.isEnabled"
        :model-value="answer"
        :node="view.node"
        @update:model-value="(value) => updateAnswer(value)"
      />
    </div>
  </div>
</template>
