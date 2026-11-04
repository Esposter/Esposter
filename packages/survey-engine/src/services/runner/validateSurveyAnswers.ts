import type { SurveyAnswerIssue } from "#src/models/SurveyAnswerIssue";
import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyDocument } from "#src/models/SurveyDocument";

import { SurveyAnswerValidationMode } from "#src/models/SurveyAnswerValidationMode";
import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { flattenSurveyQuestions } from "#src/services/flattenSurveyQuestions";
import { checkSurveyAnswerEmpty } from "#src/services/runner/answer/checkSurveyAnswerEmpty";
import { checkIsSurveyAnsweringNode } from "#src/services/runner/checkIsSurveyAnsweringNode";
import { SURVEY_NOT_SHOWN_MESSAGE, SURVEY_UNKNOWN_QUESTION_MESSAGE } from "#src/services/runner/constants";
import { flattenSurveyElementViews } from "#src/services/runner/flattenSurveyElementViews";
import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";
import { getSurveyPanelRowAnswers } from "#src/services/runner/getSurveyPanelRowAnswers";
import { getSurveyQuestionErrors } from "#src/services/runner/getSurveyQuestionErrors";
import { getSurveyRunnerValues } from "#src/services/runner/getSurveyRunnerValues";

// The issues a response's answers hold against the document: a name no question holds, an answer to a question that is not shown
// Each answer a shown question refuses, by the runner's own check of a question
// A submit also refuses a shown required question that is unanswered
// A draft checks only the answers it holds, since a respondent may not have reached a required question yet
export const validateSurveyAnswers = (
  document: SurveyDocument,
  answers: SurveyAnswers,
  mode: SurveyAnswerValidationMode,
  now: Date,
): SurveyAnswerIssue[] => {
  const isSubmit = mode === SurveyAnswerValidationMode.Submit;
  const values = getSurveyRunnerValues(document, answers, now);
  const views = flattenSurveyElementViews(
    document.content.flatMap((_node, pageIndex) => getSurveyPageViews(document, pageIndex, values, now)),
  );
  // The questions a page holds, read through the panels that hold them. A dynamic panel's template is not among them, since its names are its own
  const questionNames = new Set(
    flattenSurveyQuestions(document.content)
      .filter((node) => checkIsSurveyAnsweringNode(node))
      .map((node) => node.props.name),
  );
  const shownNames = new Set(
    views.flatMap(({ node }) => (node.type === SurveyNodeType.Panel ? [] : [node.props.name])),
  );
  // A submit also carries the values the survey calculates into its result. They answer no question, so they are accepted as they are
  const calculatedNames = new Set(isSubmit ? document.root.props.calculatedValues.map(({ name }) => name) : []);

  const issues: SurveyAnswerIssue[] = [];
  for (const name of Object.keys(answers)) {
    if (calculatedNames.has(name)) continue;

    if (!questionNames.has(name)) issues.push({ message: SURVEY_UNKNOWN_QUESTION_MESSAGE, name });
    else if (isSubmit && !shownNames.has(name)) issues.push({ message: SURVEY_NOT_SHOWN_MESSAGE, name });
  }
  // A submit refuses a row's answer to a template question the row does not show, as it refuses an answer to a hidden question
  for (const { node } of views) {
    if (!isSubmit || node.type !== SurveyNodeType.PanelDynamic) continue;

    const rows = answers[node.props.name];
    if (!Array.isArray(rows)) continue;

    for (const row of rows) {
      if (typeof row !== "object" || Array.isArray(row)) continue;

      const shownRow = getSurveyPanelRowAnswers(node, row, values, now);
      if (Object.keys(shownRow).length < Object.keys(row).length)
        issues.push({ message: SURVEY_NOT_SHOWN_MESSAGE, name: node.props.name });
    }
  }

  for (const view of views) {
    if (view.node.type === SurveyNodeType.Panel) continue;
    if (!isSubmit && checkSurveyAnswerEmpty(answers[view.node.props.name])) continue;

    issues.push(...getSurveyQuestionErrors(view, answers, values, now).map(({ message, name }) => ({ message, name })));
  }
  return issues;
};
