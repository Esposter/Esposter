import { GeneralNodeTypes } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import { NodeCategory } from "#shared/models/flowchartEditor/node/NodeCategory";

export const NodeCategoryTypeMap = {
  [NodeCategory.General]: [...GeneralNodeTypes],
} as const satisfies Record<NodeCategory, string[]>;
