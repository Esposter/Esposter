import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyElementView } from "#src/models/SurveyElementView";
import type { SurveyPageError } from "#src/models/SurveyPageError";
import type { SurveyLogicContext } from "survey-logic";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { isSurveyAnswerEmpty } from "#src/services/runner/answer/isSurveyAnswerEmpty";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { checkSurveyExpressionHolds } from "#src/services/runner/checkSurveyExpressionHolds";
import { createSurveyAnswerSchema } from "#src/services/runner/createSurveyAnswerSchema";
import { toSurveyLogicValue } from "#src/services/runner/toSurveyLogicValue";

// The errors one element holds: a required question left empty, an answer its schema refuses, then each validator that does not hold
// Only an enabled question is checked, since a disabled one takes no answer
// The type checks narrow the node to a question holding a validator list, which an includes call over the types would not do
export const getSurveyQuestionErrors = (
  view: SurveyElementView,
  answers: SurveyAnswers,
  values: SurveyLogicContext["values"],
  now: Date,
): SurveyPageError[] => {
  const { node, pointer } = view;
  if (
    !view.isEnabled ||
    node.type === SurveyNodeType.Panel ||
    node.type === SurveyNodeType.Html ||
    node.type === SurveyNodeType.Image
  )
    return [];

  const { name } = node.props;
  const answer = answers[name];
  // The undefined test narrows the answer past the check, which the predicate's unknown parameter would not
  if (answer === undefined || isSurveyAnswerEmpty(answer)) {
    if (!view.isRequired) return [];

    const message = node.props.requiredErrorText === "" ? SURVEY_REQUIRED_MESSAGE : node.props.requiredErrorText;
    return [{ message, name, pointer }];
  }

  if (!createSurveyAnswerSchema(node).safeParse(answer).success)
    return [{ message: SURVEY_INVALID_ANSWER_MESSAGE, name, pointer }];

  // The validator reads the answer as `{value}`, the one name it may read beyond the survey's own
  const value = toSurveyLogicValue(answer);
  return node.props.validators
    .filter((validator) => !checkSurveyExpressionHolds(validator.expression, { ...values, value }, now))
    .map((validator) => ({ message: validator.text, name, pointer }));
};
