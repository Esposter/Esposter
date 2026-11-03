import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";

import { checkSurveyExpressionField } from "#src/services/checkSurveyExpressionField";
import { checkSurveyOptionalExpression } from "#src/services/checkSurveyOptionalExpression";
import { getBlockPropPointer } from "headless-block-editor";

// A question's name is unique among the names of its scope, and each condition and validator it holds parses
export const checkSurveyQuestion = (
  props: SurveyQuestionBaseProps,
  nodePointer: string,
  names: Set<string>,
  issues: SurveyDocumentIssue[],
): void => {
  if (names.has(props.name))
    issues.push({
      message: `The name "${props.name}" is already used by an earlier question`,
      pointer: getBlockPropPointer(nodePointer, "name"),
    });
  else names.add(props.name);

  checkSurveyOptionalExpression(
    props.visibleIf,
    "visibility condition",
    getBlockPropPointer(nodePointer, "visibleIf"),
    issues,
  );
  checkSurveyOptionalExpression(
    props.enableIf,
    "enable condition",
    getBlockPropPointer(nodePointer, "enableIf"),
    issues,
  );
  checkSurveyOptionalExpression(
    props.requiredIf,
    "required condition",
    getBlockPropPointer(nodePointer, "requiredIf"),
    issues,
  );

  const validatorsPointer = getBlockPropPointer(nodePointer, "validators");
  for (const [index, validator] of props.validators.entries())
    checkSurveyExpressionField(
      validator.expression,
      "validator expression",
      `${validatorsPointer}/${index}/expression`,
      issues,
    );
};
