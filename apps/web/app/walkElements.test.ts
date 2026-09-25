import type { ElementNode, RootNode, TemplateChildNode } from "@vue/compiler-core";

import { NodeTypes } from "@vue/compiler-core";
import { describe } from "vitest";

// Only a root, an element, a `v-for` and a `v-if` branch hold template children; a `v-if` holds branches
export const walkElements = (node: RootNode | TemplateChildNode, visit: (element: ElementNode) => void): void => {
  if (node.type === NodeTypes.ELEMENT) visit(node);
  if (node.type === NodeTypes.IF) for (const branch of node.branches) walkElements(branch, visit);
  else if (
    node.type === NodeTypes.ROOT ||
    node.type === NodeTypes.ELEMENT ||
    node.type === NodeTypes.FOR ||
    node.type === NodeTypes.IF_BRANCH
  )
    for (const child of node.children) walkElements(child, visit);
};

describe.todo("walkElements");
