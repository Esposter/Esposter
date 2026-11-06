import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyLogicContext } from "survey-expression";

import { getSurveyExpressionNodes } from "#src/services/runner/getSurveyExpressionNodes";
import { checkIsDeepEqual } from "@esposter/shared";
import { runSurveyExpression, toSurveyLogicAnswers } from "survey-expression";

// A value that reads a later one settles a pass behind it, so the passes bound how far a chain can read ahead
const MAX_SURVEY_RUNNER_PASSES = 5;

// The answers and the calculated values as the expressions read them. The calculated values are evaluated in document order
// The pass repeats until none changes; a value that errors, or still changes after the last pass, is left out
// A calculated value never overwrites an answer, so one whose name an answer holds is not evaluated at all
export const getSurveyRunnerValues = (
  document: SurveyDocument,
  answers: SurveyAnswers,
  now: Date,
): SurveyLogicContext["values"] => {
  const values: SurveyLogicContext["values"] = toSurveyLogicAnswers(answers);

  const calculations = [
    ...document.root.props.calculatedValues,
    ...getSurveyExpressionNodes(document).map((node) => node.props),
  ].filter(({ name }) => !Object.hasOwn(answers, name));
  let changedNames: string[] = [];
  for (let pass = 0; pass < MAX_SURVEY_RUNNER_PASSES; pass++) {
    changedNames = [];
    for (const { expression, name } of calculations) {
      const previous = values[name];
      const next = runSurveyExpression(expression, { now, scopes: {}, values }).unwrapOr(undefined);
      if (next === undefined) delete values[name];
      else values[name] = next;

      if (!checkIsDeepEqual(previous, values[name])) changedNames.push(name);
    }
    if (changedNames.length === 0) return values;
  }

  for (const name of changedNames) delete values[name];
  return values;
};
