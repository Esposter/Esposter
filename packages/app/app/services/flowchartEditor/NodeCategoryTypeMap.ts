import { GeneralNodeType } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import { NodeCategory } from "#shared/models/flowchartEditor/node/NodeCategory";

export const NodeCategoryTypeMap = {
  [NodeCategory.General]: Object.values(GeneralNodeType),
} as const satisfies Record<NodeCategory, string[]>;
