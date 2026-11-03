import { checkSurveyExpression } from "survey-logic";

// The message a refused expression is shown with, naming the character it is refused at, or none when it checks
export const getSurveyExpressionFault = (source: string): string | undefined => {
  const error = checkSurveyExpression(source);
  return error === undefined ? undefined : `${error.message} at character ${error.position + 1}`;
};
