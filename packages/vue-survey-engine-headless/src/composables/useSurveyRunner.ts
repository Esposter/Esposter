import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";
import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyPageError } from "#src/models/SurveyPageError";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyPanelRowView } from "#src/models/SurveyPanelRowView";
import type { SurveyRunner } from "#src/models/SurveyRunner";
import type { MaybeRefOrGetter } from "vue";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkIsLastSurveyPage } from "#src/services/runner/checkIsLastSurveyPage";
import { completeSurvey } from "#src/services/runner/completeSurvey";
import { createSurveyRunnerState } from "#src/services/runner/createSurveyRunnerState";
import { getSurveyPageElements } from "#src/services/runner/getSurveyPageElements";
import { getSurveyPanelRowViews } from "#src/services/runner/getSurveyPanelRowViews";
import { getSurveyProgress } from "#src/services/runner/getSurveyProgress";
import { getSurveyRunnerValues } from "#src/services/runner/getSurveyRunnerValues";
import { getSurveyVisiblePageIndexes } from "#src/services/runner/getSurveyVisiblePageIndexes";
import { goToNextSurveyPage } from "#src/services/runner/goToNextSurveyPage";
import { goToPreviousSurveyPage } from "#src/services/runner/goToPreviousSurveyPage";
import { numberSurveyQuestions } from "#src/services/runner/numberSurveyQuestions";
import { setSurveyAnswer } from "#src/services/runner/setSurveyAnswer";
import { v7 } from "uuid";
import { computed, ref, toValue } from "vue";

// A respondent's session over a survey document: the state the runner's functions move, the errors that block a move and
// The clock they read. The Vue wrapper over those functions, so the page holds nothing of the survey's own
export const useSurveyRunner = (
  document: MaybeRefOrGetter<SurveyDocument>,
  {
    answers = {},
    pageIndex = 0,
    // A session's seed orders the choices of a question that shuffles them, so one respondent sees one order throughout
    seed: initialSeed = v7(),
  }: { answers?: SurveyAnswers; pageIndex?: number; seed?: string } = {},
): SurveyRunner => {
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
  const values = computed(() => getSurveyRunnerValues(getDocument(), state.value.answers, now.value));
  // A dynamic panel's row shows the template questions its own answers show, read against the same values the page reads
  const getRowViews = (node: SurveyPanelDynamicNode, row: SurveyAnswers): SurveyPanelRowView[] =>
    getSurveyPanelRowViews(node, row, values.value, now.value);
  const visiblePageIndexes = computed(() => getSurveyVisiblePageIndexes(getDocument(), state.value.answers, now.value));
  const isFirstPage = computed(() => visiblePageIndexes.value[0] === state.value.pageIndex);
  const isLastPage = computed(() => checkIsLastSurveyPage(getDocument(), state.value, now.value));
  const isCompleted = computed(() => state.value.isCompleted);
  // The numbers of the questions on the pages up to the current one, so the current page's numbering carries on from them
  const questionNumbers = computed(() => {
    const numbers = new Map<string, number>();
    if (!getDocument().root.props.isQuestionNumbersVisible) return numbers;

    for (const visiblePageIndex of visiblePageIndexes.value) {
      if (visiblePageIndex > state.value.pageIndex) break;

      numberSurveyQuestions(
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
    getRowViews,
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
