import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyNodeDefinitionMap } from "#src/models/SurveyNodeDefinitionMap";

// The definition of any survey node type: the union of the map's per-type definitions
export type SurveyNodeDefinition = SurveyNodeDefinitionMap[SurveyNode["type"]];
