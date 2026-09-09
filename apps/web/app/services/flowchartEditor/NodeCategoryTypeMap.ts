import { GeneralNodeTypes } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import { NodeCategory } from "@/models/flowchartEditor/node/NodeCategory";

export const NodeCategoryTypeMap = {
  [NodeCategory.General]: GeneralNodeTypes,
} as const satisfies Record<NodeCategory, string[]>;
// Derived at the map rather than at the sidebar that renders it, so the categories and the types they hold
// Cannot drift apart
export const NodeCategoryTypeEntries = Object.entries(NodeCategoryTypeMap);
