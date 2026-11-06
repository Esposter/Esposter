import type { SurveyQuestionNode } from "#src/models/SurveyQuestionNode";
import type { SurveyLogicContext } from "survey-expression";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyBooleanAnswerSchema } from "#src/services/runner/answer/createSurveyBooleanAnswerSchema";
import { createSurveyButtonGroupAnswerSchema } from "#src/services/runner/answer/createSurveyButtonGroupAnswerSchema";
import { createSurveyCheckboxAnswerSchema } from "#src/services/runner/answer/createSurveyCheckboxAnswerSchema";
import { createSurveyCommentAnswerSchema } from "#src/services/runner/answer/createSurveyCommentAnswerSchema";
import { createSurveyDropdownAnswerSchema } from "#src/services/runner/answer/createSurveyDropdownAnswerSchema";
import { createSurveyExpressionAnswerSchema } from "#src/services/runner/answer/createSurveyExpressionAnswerSchema";
import { createSurveyImagePickerAnswerSchema } from "#src/services/runner/answer/createSurveyImagePickerAnswerSchema";
import { createSurveyMatrixAnswerSchema } from "#src/services/runner/answer/createSurveyMatrixAnswerSchema";
import { createSurveyMatrixDynamicAnswerSchema } from "#src/services/runner/answer/createSurveyMatrixDynamicAnswerSchema";
import { createSurveyMultipleTextAnswerSchema } from "#src/services/runner/answer/createSurveyMultipleTextAnswerSchema";
import { createSurveyPanelDynamicAnswerSchema } from "#src/services/runner/answer/createSurveyPanelDynamicAnswerSchema";
import { createSurveyRadioGroupAnswerSchema } from "#src/services/runner/answer/createSurveyRadioGroupAnswerSchema";
import { createSurveyRankingAnswerSchema } from "#src/services/runner/answer/createSurveyRankingAnswerSchema";
import { createSurveyRatingAnswerSchema } from "#src/services/runner/answer/createSurveyRatingAnswerSchema";
import { createSurveySliderAnswerSchema } from "#src/services/runner/answer/createSurveySliderAnswerSchema";
import { createSurveyTagBoxAnswerSchema } from "#src/services/runner/answer/createSurveyTagBoxAnswerSchema";
import { createSurveyTextAnswerSchema } from "#src/services/runner/answer/createSurveyTextAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { exhaustiveGuard } from "@esposter/shared";
import { z } from "zod";

// The schema of one answer a respondent gave to a question, switched on the question's type
// An answer that is absent is not checked here, since whether a question must be answered is the flow's to say
// The survey's values and the clock are what a dynamic panel's template reads each of its rows against
export const createSurveyAnswerSchema = (
  node: SurveyQuestionNode,
  values: SurveyLogicContext["values"],
  now: Date,
): z.ZodType => {
  switch (node.type) {
    case SurveyNodeType.Boolean:
      return createSurveyBooleanAnswerSchema();
    case SurveyNodeType.ButtonGroup:
      return createSurveyButtonGroupAnswerSchema(node);
    case SurveyNodeType.Checkbox:
      return createSurveyCheckboxAnswerSchema(node);
    case SurveyNodeType.Comment:
      return createSurveyCommentAnswerSchema(node);
    case SurveyNodeType.Dropdown:
      return createSurveyDropdownAnswerSchema(node);
    case SurveyNodeType.Expression:
      return createSurveyExpressionAnswerSchema();
    case SurveyNodeType.Html:
    case SurveyNodeType.Image:
      return z.undefined({ error: SURVEY_INVALID_ANSWER_MESSAGE });
    case SurveyNodeType.ImagePicker:
      return createSurveyImagePickerAnswerSchema(node);
    case SurveyNodeType.Matrix:
      return createSurveyMatrixAnswerSchema(node);
    case SurveyNodeType.MatrixDynamic:
      return createSurveyMatrixDynamicAnswerSchema(node);
    case SurveyNodeType.MultipleText:
      return createSurveyMultipleTextAnswerSchema(node);
    case SurveyNodeType.PanelDynamic:
      return createSurveyPanelDynamicAnswerSchema(
        node,
        (question) => createSurveyAnswerSchema(question, values, now),
        values,
        now,
      );
    case SurveyNodeType.RadioGroup:
      return createSurveyRadioGroupAnswerSchema(node);
    case SurveyNodeType.Ranking:
      return createSurveyRankingAnswerSchema(node);
    case SurveyNodeType.Rating:
      return createSurveyRatingAnswerSchema(node);
    case SurveyNodeType.Slider:
      return createSurveySliderAnswerSchema(node);
    case SurveyNodeType.TagBox:
      return createSurveyTagBoxAnswerSchema(node);
    case SurveyNodeType.Text:
      return createSurveyTextAnswerSchema(node);
    default:
      return exhaustiveGuard(node);
  }
};
