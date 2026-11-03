import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

// Each survey node type's definition, keyed by its type and typed by the node that type holds
export type SurveyNodeDefinitionMap = {
  [K in SurveyNode["type"]]: SurveyNodeTypeDefinition<Extract<SurveyNode, { type: K }>>;
};
