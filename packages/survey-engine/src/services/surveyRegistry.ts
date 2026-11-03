import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyNodeDefinition } from "#src/models/SurveyNodeDefinition";
import type { SurveyRootProps } from "#src/models/SurveyRootProps";
import type { BlockRegistry } from "headless-block-editor";

import { surveyRootPropsSchema } from "#src/models/SurveyRootProps";
import { surveyNodeTypeDefinitionMap } from "#src/services/surveyNodeTypeDefinitionMap";
import { SURVEY_ROOT_NODE_TYPES } from "#src/services/surveyNodeTypeLists";

// The survey's registry: the root takes pages and the survey's root props, and every type is in its list
export const surveyRegistry: BlockRegistry<SurveyNode, SurveyRootProps, SurveyNodeDefinition> = {
  root: { content: SURVEY_ROOT_NODE_TYPES, propsSchema: surveyRootPropsSchema },
  types: Object.values(surveyNodeTypeDefinitionMap),
};
