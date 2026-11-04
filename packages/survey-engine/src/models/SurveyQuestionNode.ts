import type { SurveyBooleanNode } from "#src/models/SurveyBooleanNode";
import type { SurveyButtonGroupNode } from "#src/models/SurveyButtonGroupNode";
import type { SurveyCheckboxNode } from "#src/models/SurveyCheckboxNode";
import type { SurveyCommentNode } from "#src/models/SurveyCommentNode";
import type { SurveyDropdownNode } from "#src/models/SurveyDropdownNode";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyHtmlNode } from "#src/models/SurveyHtmlNode";
import type { SurveyImageNode } from "#src/models/SurveyImageNode";
import type { SurveyImagePickerNode } from "#src/models/SurveyImagePickerNode";
import type { SurveyMatrixDynamicNode } from "#src/models/SurveyMatrixDynamicNode";
import type { SurveyMatrixNode } from "#src/models/SurveyMatrixNode";
import type { SurveyMultipleTextNode } from "#src/models/SurveyMultipleTextNode";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyRadioGroupNode } from "#src/models/SurveyRadioGroupNode";
import type { SurveyRankingNode } from "#src/models/SurveyRankingNode";
import type { SurveyRatingNode } from "#src/models/SurveyRatingNode";
import type { SurveySliderNode } from "#src/models/SurveySliderNode";
import type { SurveyTagBoxNode } from "#src/models/SurveyTagBoxNode";
import type { SurveyTextNode } from "#src/models/SurveyTextNode";

// Any question a survey holds, of whichever of its kinds, narrowed by its type tag
export type SurveyQuestionNode =
  | SurveyBooleanNode
  | SurveyButtonGroupNode
  | SurveyCheckboxNode
  | SurveyCommentNode
  | SurveyDropdownNode
  | SurveyExpressionNode
  | SurveyHtmlNode
  | SurveyImageNode
  | SurveyImagePickerNode
  | SurveyMatrixDynamicNode
  | SurveyMatrixNode
  | SurveyMultipleTextNode
  | SurveyPanelDynamicNode
  | SurveyRadioGroupNode
  | SurveyRankingNode
  | SurveyRatingNode
  | SurveySliderNode
  | SurveyTagBoxNode
  | SurveyTextNode;
