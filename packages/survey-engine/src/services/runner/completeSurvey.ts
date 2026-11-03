import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyRunnerCompletion } from "#src/models/SurveyRunnerCompletion";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { flattenSurveyElementViews } from "#src/services/runner/flattenSurveyElementViews";
import { getSurveyPageErrors } from "#src/services/runner/getSurveyPageErrors";
import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";
import { getSurveyRunnerValues } from "#src/services/runner/getSurveyRunnerValues";
import { getSurveyVisiblePageIndexes } from "#src/services/runner/getSurveyVisiblePageIndexes";
import { toSurveyAnswerValue } from "#src/services/runner/toSurveyAnswerValue";

// Completes the survey once every visible page is valid. The first page with errors is returned and the state moves to it, unfinished
// A completed survey keeps the answers of visible questions
// It holds the values the result includes: each visible calculated-value question and each calculated value flagged for the result
// The values are computed over the kept answers, so a result never reads one it dropped
export const completeSurvey = (
  document: SurveyDocument,
  state: SurveyRunnerState,
  now: Date,
): SurveyRunnerCompletion => {
  const values = getSurveyRunnerValues(document, state.answers, now);
  const pageIndexes = getSurveyVisiblePageIndexes(document, state.answers, now);
  for (const pageIndex of pageIndexes) {
    const errors = getSurveyPageErrors(document, pageIndex, state.answers, values, now);
    if (errors.length > 0) return { answers: {}, errors, state: { ...state, isCompleted: false, pageIndex } };
  }

  const visibleNodes = pageIndexes.flatMap((pageIndex) =>
    flattenSurveyElementViews(getSurveyPageViews(document, pageIndex, values, now)).map((view) => view.node),
  );
  const visibleNames = new Set(
    visibleNodes.flatMap((node) => (node.type === SurveyNodeType.Panel ? [] : [node.props.name])),
  );
  const answers: SurveyAnswers = Object.fromEntries(
    Object.entries(state.answers).filter(([name]) => visibleNames.has(name)),
  );

  const includedNames = [
    ...visibleNodes.flatMap((node) => (node.type === SurveyNodeType.Expression ? [node.props.name] : [])),
    ...document.root.props.calculatedValues
      .filter(({ includeIntoResult }) => includeIntoResult)
      .map(({ name }) => name),
  ];
  const completedValues = getSurveyRunnerValues(document, answers, now);
  const resultAnswers: SurveyAnswers = { ...answers };
  for (const name of includedNames) {
    const answer = toSurveyAnswerValue(completedValues[name]);
    if (answer !== undefined) resultAnswers[name] = answer;
  }

  return { answers: resultAnswers, errors: [], state: { ...state, answers, isCompleted: true } };
};
