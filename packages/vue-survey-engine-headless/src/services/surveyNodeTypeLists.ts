import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";
import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";

// The types the root accepts: pages only
export const SURVEY_ROOT_NODE_TYPES: SurveyNodeType.Page[] = [SurveyNodeType.Page];

// The types a page or a panel accepts: every type but a page
export const SURVEY_PLACEABLE_NODE_TYPES: SurveyPlaceableNode["type"][] = Object.values(SurveyNodeType).filter(
  (type): type is SurveyPlaceableNode["type"] => type !== SurveyNodeType.Page,
);

// The types a dynamic panel's template accepts: every type but the two panel types
export const SURVEY_TEMPLATE_NODE_TYPES: SurveyTemplateNode["type"][] = SURVEY_PLACEABLE_NODE_TYPES.filter(
  (type): type is SurveyTemplateNode["type"] => type !== SurveyNodeType.Panel && type !== SurveyNodeType.PanelDynamic,
);
