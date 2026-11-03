import type { SurveyNodeDefinitionMap } from "#src/models/SurveyNodeDefinitionMap";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyBooleanNodeType } from "#src/services/surveyBooleanNodeType";
import { surveyButtonGroupNodeType } from "#src/services/surveyButtonGroupNodeType";
import { surveyCheckboxNodeType } from "#src/services/surveyCheckboxNodeType";
import { surveyCommentNodeType } from "#src/services/surveyCommentNodeType";
import { surveyDropdownNodeType } from "#src/services/surveyDropdownNodeType";
import { surveyExpressionNodeType } from "#src/services/surveyExpressionNodeType";
import { surveyHtmlNodeType } from "#src/services/surveyHtmlNodeType";
import { surveyImageNodeType } from "#src/services/surveyImageNodeType";
import { surveyImagePickerNodeType } from "#src/services/surveyImagePickerNodeType";
import { surveyMatrixNodeType } from "#src/services/surveyMatrixNodeType";
import { surveyMatrixDynamicNodeType } from "#src/services/surveyMatrixDynamicNodeType";
import { surveyMultipleTextNodeType } from "#src/services/surveyMultipleTextNodeType";
import { surveyPageNodeType } from "#src/services/surveyPageNodeType";
import { surveyPanelNodeType } from "#src/services/surveyPanelNodeType";
import { surveyPanelDynamicNodeType } from "#src/services/surveyPanelDynamicNodeType";
import { surveyRadioGroupNodeType } from "#src/services/surveyRadioGroupNodeType";
import { surveyRankingNodeType } from "#src/services/surveyRankingNodeType";
import { surveyRatingNodeType } from "#src/services/surveyRatingNodeType";
import { surveySliderNodeType } from "#src/services/surveySliderNodeType";
import { surveyTagBoxNodeType } from "#src/services/surveyTagBoxNodeType";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";

// Every survey type's shared half, keyed by its type, so a type missing from either half fails the typecheck
export const surveyNodeTypeDefinitionMap: SurveyNodeDefinitionMap = {
  [SurveyNodeType.Page]: surveyPageNodeType,
  [SurveyNodeType.Panel]: surveyPanelNodeType,
  [SurveyNodeType.Text]: surveyTextNodeType,
  [SurveyNodeType.Comment]: surveyCommentNodeType,
  [SurveyNodeType.Boolean]: surveyBooleanNodeType,
  [SurveyNodeType.RadioGroup]: surveyRadioGroupNodeType,
  [SurveyNodeType.Dropdown]: surveyDropdownNodeType,
  [SurveyNodeType.Checkbox]: surveyCheckboxNodeType,
  [SurveyNodeType.TagBox]: surveyTagBoxNodeType,
  [SurveyNodeType.Rating]: surveyRatingNodeType,
  [SurveyNodeType.Ranking]: surveyRankingNodeType,
  [SurveyNodeType.Matrix]: surveyMatrixNodeType,
  [SurveyNodeType.MatrixDynamic]: surveyMatrixDynamicNodeType,
  [SurveyNodeType.PanelDynamic]: surveyPanelDynamicNodeType,
  [SurveyNodeType.MultipleText]: surveyMultipleTextNodeType,
  [SurveyNodeType.Slider]: surveySliderNodeType,
  [SurveyNodeType.ButtonGroup]: surveyButtonGroupNodeType,
  [SurveyNodeType.ImagePicker]: surveyImagePickerNodeType,
  [SurveyNodeType.Expression]: surveyExpressionNodeType,
  [SurveyNodeType.Html]: surveyHtmlNodeType,
  [SurveyNodeType.Image]: surveyImageNodeType,
};
