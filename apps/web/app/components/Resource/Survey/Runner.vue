<script setup lang="ts">
import type { SurveyAnswers, SurveyDocument } from "headless-survey-engine";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { SURVEY_FOCUSABLE_SELECTOR } from "@/services/resource/survey/constants";
import { SurveyProgressBarPlacement } from "headless-survey-engine";

interface Props {
  document: SurveyDocument;
  // The answers and page a respondent resumes from, when a draft was stored
  initialAnswers?: SurveyAnswers;
  initialPageIndex?: number;
  isDisabled?: true;
  // What a shuffled choice list is ordered by, a resumed response's id, so a respondent sees one order across visits
  seed?: string;
}

const { document, initialAnswers, initialPageIndex, isDisabled = false, seed: initialSeed } = defineProps<Props>();
const emit = defineEmits<{
  change: [value: { answers: SurveyAnswers; pageIndex: number }];
  complete: [answers: SurveyAnswers];
}>();
const rootProps = computed(() => document.root.props);
const themeStyle = useSurveyTheme(rootProps);
const {
  complete,
  errorByPointer,
  errors,
  getRowViews,
  isFirstPage,
  isLastPage,
  next,
  page,
  pageElements,
  previous,
  progress,
  questionNumbers,
  seed,
  setAnswer,
  state,
} = useSurveyRunner(() => document, { answers: initialAnswers, pageIndex: initialPageIndex, seed: initialSeed });
const root = useTemplateRef("root");
const progressLabel = computed(() => `Page ${progress.value.current} of ${progress.value.total}`);
const progressValue = computed(() => (progress.value.current / Math.max(progress.value.total, 1)) * 100);
// Every answer and page move is reported, so the page saves the respondent's progress as it goes
const emitChange = () => {
  emit("change", { answers: state.value.answers, pageIndex: state.value.pageIndex });
};
// A blocked move moves focus to the control of its first error, which only the page knows
const focusFirstError = () => {
  const [firstError] = errors.value;
  if (!firstError) return;

  const wrapper = [...(root.value?.querySelectorAll<HTMLElement>("[data-pointer]") ?? [])].find(
    (element) => element.dataset.pointer === firstError.pointer,
  );
  wrapper?.querySelector<HTMLElement>(SURVEY_FOCUSABLE_SELECTOR)?.focus();
};
// A passing completion hands its answers to the page; a blocked one leaves focus where the error is
const submit = () => {
  const answers = complete();
  if (answers) emit("complete", answers);
  nextTick(focusFirstError);
};
</script>

<template>
  <div ref="root" :style="themeStyle" bg-background flex flex-col gap-4 ui-body>
    <UiLoadingLine
      v-if="rootProps.showProgressBar === SurveyProgressBarPlacement.Top"
      :label="progressLabel"
      :value="progressValue"
    />
    <header v-if="rootProps.logo || rootProps.title || rootProps.description" flex flex-col gap-2>
      <NuxtImg v-if="rootProps.logo" :src="rootProps.logo" alt="" h-12 w-auto self-start object-contain />
      <h1 v-if="rootProps.title" ui-heading>{{ rootProps.title }}</h1>
      <p v-if="rootProps.description" text-muted>{{ rootProps.description }}</p>
    </header>
    <section v-if="page" flex flex-col gap-4>
      <div v-if="page.props.title || page.props.description" flex flex-col gap-1>
        <h2 v-if="page.props.title" ui-title>{{ page.props.title }}</h2>
        <p v-if="page.props.description" text-muted>{{ page.props.description }}</p>
      </div>
      <UiAlert v-if="errors.length" status="error">{{ errors[0]?.message }}</UiAlert>
      <ResourceSurveyRunnerElement
        v-for="view of pageElements"
        :key="view.pointer"
        :answers="state.answers"
        :error-by-pointer
        :get-row-views
        :is-disabled
        :question-numbers
        :seed
        :view
        @answer="
          (name, value) => {
            setAnswer(name, value);
            emitChange();
          }
        "
      />
    </section>
    <div flex gap-2 justify-end>
      <UiButton
        v-if="!isFirstPage"
        :disabled="isDisabled"
        @click="
          previous();
          emitChange();
        "
      >
        {{ rootProps.pagePrevText || "Previous" }}
      </UiButton>
      <UiButton v-if="isLastPage" :disabled="isDisabled" :variant="UiButtonVariant.Accent" @click="submit()">
        {{ rootProps.completeText || "Complete" }}
      </UiButton>
      <UiButton
        v-else
        :disabled="isDisabled"
        :variant="UiButtonVariant.Accent"
        @click="
          next();
          emitChange();
          nextTick(focusFirstError);
        "
      >
        {{ rootProps.pageNextText || "Next" }}
      </UiButton>
    </div>
    <UiLoadingLine
      v-if="rootProps.showProgressBar === SurveyProgressBarPlacement.Bottom"
      :label="progressLabel"
      :value="progressValue"
    />
  </div>
</template>
