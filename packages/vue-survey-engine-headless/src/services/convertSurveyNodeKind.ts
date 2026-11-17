import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyNodeKindChange } from "#src/models/SurveyNodeKindChange";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";

import { surveyNodeSchema } from "#src/services/surveyNodeSchema";
import { surveyNodeTypeDefinitionMap } from "#src/services/surveyNodeTypeDefinitionMap";
import { checkIsDeepEqual } from "@esposter/shared";

// The props a kind change carries whichever kinds it joins: the id, the name, the texts, the required flag and the visibility condition.
// The choices join them only when both kinds hold choices. Every other prop takes the new kind's default
const KEPT_PROP_NAMES = new Set(["description", "id", "isRequired", "name", "title", "visibleIf"]);

// The node converted to the kind, or undefined when the survey schema does not take the result as a node of that kind
export const convertSurveyNodeKind = (node: SurveyNode, type: SurveyNodeType): SurveyNodeKindChange | undefined => {
  const defaults = surveyNodeTypeDefinitionMap[type].createDefaultProps();
  const currentDefaults = new Map<string, unknown>(
    Object.entries(surveyNodeTypeDefinitionMap[node.type].createDefaultProps()),
  );
  const isKept = (name: string) => KEPT_PROP_NAMES.has(name) || (name === "choices" && "choices" in defaults);
  const keptProps = Object.fromEntries(Object.entries(node.props).filter(([name]) => isKept(name)));
  const parsedNode = surveyNodeSchema.safeParse({ props: { ...defaults, ...keptProps }, type });
  if (!parsedNode.success) return undefined;

  const isContentDropped = Object.entries(node.props).some(
    ([name, value]) => !isKept(name) && !checkIsDeepEqual(value, currentDefaults.get(name)),
  );
  return { isContentDropped, node: parsedNode.data };
};
