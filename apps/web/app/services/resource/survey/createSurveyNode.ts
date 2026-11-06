import type { SurveyNode, SurveyNodeType } from "headless-survey-engine";

import { surveyNodeSchema, surveyNodeTypeDefinitionMap } from "headless-survey-engine";

// The node a new element of a type is, under its own id and name, with each of its slots an empty list. The node schema
// Parses it, so a node that schema refuses is no node at all rather than one a type assertion has let through
export const createSurveyNode = (type: SurveyNodeType, id: string, name: string): SurveyNode | undefined => {
  const { createDefaultProps, slots } = surveyNodeTypeDefinitionMap[type];
  const props = {
    ...createDefaultProps(),
    ...Object.fromEntries(Object.keys(slots).map((slot): [string, never[]] => [slot, []])),
    id,
  };
  const result = surveyNodeSchema.safeParse({ props: "name" in props ? { ...props, name } : props, type });
  return result.success ? result.data : undefined;
};
