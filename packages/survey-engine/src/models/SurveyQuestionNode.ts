import type { SurveyTextNode } from "#src/models/SurveyTextNode";
import type { SurveyCommentNode } from "#src/models/SurveyCommentNode";
import type { SurveyBooleanNode } from "#src/models/SurveyBooleanNode";
import type { SurveyRadioGroupNode } from "#src/models/SurveyRadioGroupNode";
import type { SurveyDropdownNode } from "#src/models/SurveyDropdownNode";
import type { SurveyCheckboxNode } from "#src/models/SurveyCheckboxNode";
import type { SurveyTagBoxNode } from "#src/models/SurveyTagBoxNode";
import type { SurveyRatingNode } from "#src/models/SurveyRatingNode";
import type { SurveyRankingNode } from "#src/models/SurveyRankingNode";
import type { SurveyMatrixNode } from "#src/models/SurveyMatrixNode";
import type { SurveyMatrixDynamicNode } from "#src/models/SurveyMatrixDynamicNode";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyMultipleTextNode } from "#src/models/SurveyMultipleTextNode";
import type { SurveySliderNode } from "#src/models/SurveySliderNode";
import type { SurveyButtonGroupNode } from "#src/models/SurveyButtonGroupNode";
import type { SurveyImagePickerNode } from "#src/models/SurveyImagePickerNode";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyHtmlNode } from "#src/models/SurveyHtmlNode";
import type { SurveyImageNode } from "#src/models/SurveyImageNode";

// Any question a survey holds, of whichever of its kinds, narrowed by its type tag
export type SurveyQuestionNode =
  | SurveyTextNode
  | SurveyCommentNode
  | SurveyBooleanNode
  | SurveyRadioGroupNode
  | SurveyDropdownNode
  | SurveyCheckboxNode
  | SurveyTagBoxNode
  | SurveyRatingNode
  | SurveyRankingNode
  | SurveyMatrixNode
  | SurveyMatrixDynamicNode
  | SurveyPanelDynamicNode
  | SurveyMultipleTextNode
  | SurveySliderNode
  | SurveyButtonGroupNode
  | SurveyImagePickerNode
  | SurveyExpressionNode
  | SurveyHtmlNode
  | SurveyImageNode;
