import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyDocument,
  SurveyElementView,
  SurveyPageError,
} from "survey-engine";

import { SURVEY_UNNUMBERED_NODE_TYPES } from "@/services/resource/survey/constants";
import {
  completeSurvey,
  createSurveyRunnerState,
  getSurveyPageElements,
  getSurveyProgress,
  getSurveyVisiblePageIndexes,
  goToNextSurveyPage,
  goToPreviousSurveyPage,
  isLastSurveyPage,
  setSurveyAnswer,
  SurveyNodeType,
} from "survey-engine";

// Questions are numbered in order across the survey, so a page carries on from the pages before it
const numberQuestions = (views: SurveyElementView[], numbers: Map<string, number>) => {
  for (const view of views) {
    // The next number is one past every question numbered so far
    if (!SURVEY_UNNUMBERED_NODE_TYPES.has(view.node.type)) numbers.set(view.pointer, numbers.size + 1);
    numberQuestions(view.children, numbers);
  }
};

// A respondent's session over a survey document: the state the runner's functions move, the errors that block a move and
// The clock they read. The app's reactive wrapper, so the page holds nothing of the survey's own
export const useSurveyRunner = (
  document: MaybeRefOrGetter<SurveyDocument>,
  {
    answers = {},
    pageIndex = 0,
    // A session's seed orders the choices of a question that shuffles them, so one respondent sees one order throughout
    seed: initialSeed = crypto.randomUUID(),
  }: { answers?: SurveyAnswers; pageIndex?: number; seed?: string } = {},
) => {
  const getDocument = () => toValue(document);
  // Refreshed by every action, so a date the expressions read is the moment of the answer or the move
  const now = ref(new Date());
  const refreshNow = () => {
    now.value = new Date();
  };
  const state = ref(createSurveyRunnerState(getDocument(), answers, pageIndex));
  const errors = ref<SurveyPageError[]>([]);
  const seed = ref(initialSeed);
  const page = computed(() => {
    const node = getDocument().content[state.value.pageIndex];
    return node?.type === SurveyNodeType.Page ? node : undefined;
  });
  const pageElements = computed(() => getSurveyPageElements(getDocument(), state.value, now.value));
  const progress = computed(() => getSurveyProgress(getDocument(), state.value, now.value));
  const visiblePageIndexes = computed(() => getSurveyVisiblePageIndexes(getDocument(), state.value.answers, now.value));
  const isFirstPage = computed(() => visiblePageIndexes.value[0] === state.value.pageIndex);
  const isLastPage = computed(() => isLastSurveyPage(getDocument(), state.value, now.value));
  const isCompleted = computed(() => state.value.isCompleted);
  // The numbers of the questions on the pages up to the current one, so the current page's numbering carries on from them
  const questionNumbers = computed(() => {
    const numbers = new Map<string, number>();
    if (!getDocument().root.props.showQuestionNumbers) return numbers;

    for (const visiblePageIndex of visiblePageIndexes.value) {
      if (visiblePageIndex > state.value.pageIndex) break;

      numberQuestions(
        getSurveyPageElements(getDocument(), { ...state.value, pageIndex: visiblePageIndex }, now.value),
        numbers,
      );
    }
    return numbers;
  });
  const errorByPointer = (pointer: string) => errors.value.find((error) => error.pointer === pointer)?.message ?? "";
  const setAnswer = (name: string, value: SurveyAnswerValue | undefined) => {
    refreshNow();
    state.value = setSurveyAnswer(state.value, name, value);
    errors.value = errors.value.filter((error) => error.name !== name);
  };
  // A blocked move keeps the state where it is and names the questions that blocked it
  const next = () => {
    refreshNow();
    const move = goToNextSurveyPage(getDocument(), state.value, now.value);
    state.value = move.state;
    errors.value = move.errors;
  };
  // Moving back never validates, so it clears the errors the page showed
  const previous = () => {
    refreshNow();
    state.value = goToPreviousSurveyPage(getDocument(), state.value, now.value);
    errors.value = [];
  };
  // The answers to store on a passing completion, and none while an error still blocks it
  const complete = () => {
    refreshNow();
    const completion = completeSurvey(getDocument(), state.value, now.value);
    state.value = completion.state;
    errors.value = completion.errors;
    return completion.errors.length === 0 ? completion.answers : undefined;
  };
  const restore = (restoredAnswers: SurveyAnswers, restoredPageIndex: number) => {
    refreshNow();
    state.value = createSurveyRunnerState(getDocument(), restoredAnswers, restoredPageIndex);
    errors.value = [];
  };

  return {
    complete,
    errorByPointer,
    errors,
    isCompleted,
    isFirstPage,
    isLastPage,
    next,
    page,
    pageElements,
    previous,
    progress,
    questionNumbers,
    restore,
    seed,
    setAnswer,
    state,
  };
};
