import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyElementView } from "#src/models/SurveyElementView";
import type { SurveyPageError } from "#src/models/SurveyPageError";
import type { SurveyLogicContext } from "survey-expression";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkIsSurveyAnsweringNode } from "#src/services/runner/checkIsSurveyAnsweringNode";
import { checkSurveyAnswerEmpty } from "#src/services/runner/checkSurveyAnswerEmpty";
import { checkSurveyExpressionHolds } from "#src/services/runner/checkSurveyExpressionHolds";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { createSurveyAnswerSchema } from "#src/services/runner/createSurveyAnswerSchema";
import { getSurveyFirstMessage } from "#src/services/runner/getSurveyFirstMessage";
import { toSurveyLogicAnswer } from "survey-expression";

// The errors one element holds: a required question left empty, an answer its schema refuses, then each validator that does not hold
// Only an enabled question is checked, since a disabled one takes no answer
// The predicate narrows the node to an answering question, which holds a validator list
export const getSurveyQuestionErrors = (
  view: SurveyElementView,
  answers: SurveyAnswers,
  values: SurveyLogicContext["values"],
  now: Date,
): SurveyPageError[] => {
  const { node, pointer } = view;
  if (!view.isEnabled || !checkIsSurveyAnsweringNode(node)) return [];

  const { name } = node.props;
  const answer = answers[name];
  // The undefined test narrows the answer past the check, which the predicate's unknown parameter would not
  if (answer === undefined || checkSurveyAnswerEmpty(answer)) {
    // A multiple text's items carry their own flags, so an unanswered one can hold a required item its question's flag does not
    const holdsRequiredItem =
      node.type === SurveyNodeType.MultipleText && node.props.items.some((item) => item.isRequired);
    if (!view.isRequired && !holdsRequiredItem) return [];

    const message = node.props.requiredErrorText === "" ? SURVEY_REQUIRED_MESSAGE : node.props.requiredErrorText;
    return [{ message, name, pointer }];
  }

  // The first refusal's message is the one the schema chose for the rule that failed, such as out of range or too short
  const result = createSurveyAnswerSchema(node, values, now).safeParse(answer);
  if (!result.success)
    return [{ message: getSurveyFirstMessage(result) ?? SURVEY_INVALID_ANSWER_MESSAGE, name, pointer }];

  // The validator reads the answer as `{value}`, the one name it may read beyond the survey's own
  const value = toSurveyLogicAnswer(answer);
  return node.props.validators
    .filter((validator) => !checkSurveyExpressionHolds(validator.expression, { ...values, value }, now))
    .map((validator) => ({ message: validator.text, name, pointer }));
};
