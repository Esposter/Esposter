import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";
import type { SurveyElementView } from "#src/models/SurveyElementView";
import type { SurveyPageError } from "#src/models/SurveyPageError";
import type { SurveyPageNode } from "#src/models/SurveyPageNode";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyPanelRowView } from "#src/models/SurveyPanelRowView";
import type { SurveyProgress } from "#src/models/SurveyProgress";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";
import type { ComputedRef, Ref } from "vue";

// A respondent's session over a survey document, as the Vue composable holds it: the state and the errors in refs, the views
// Of the current page, and the functions that move the session, each reading the clock when it runs
export interface SurveyRunner {
  complete: () => SurveyAnswers | undefined;
  errorByPointer: (pointer: string) => string;
  errors: Ref<SurveyPageError[]>;
  getRowViews: (node: SurveyPanelDynamicNode, row: SurveyAnswers) => SurveyPanelRowView[];
  isCompleted: ComputedRef<boolean>;
  isFirstPage: ComputedRef<boolean>;
  isLastPage: ComputedRef<boolean>;
  next: () => void;
  page: ComputedRef<SurveyPageNode | undefined>;
  pageElements: ComputedRef<SurveyElementView[]>;
  previous: () => void;
  progress: ComputedRef<SurveyProgress>;
  questionNumbers: ComputedRef<Map<string, number>>;
  restore: (restoredAnswers: SurveyAnswers, restoredPageIndex: number) => void;
  seed: Ref<string>;
  setAnswer: (name: string, value: SurveyAnswerValue | undefined) => void;
  state: Ref<SurveyRunnerState>;
}
