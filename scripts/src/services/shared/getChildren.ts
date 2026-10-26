import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { visitorKeys } from "oxc-parser";

const checkIsSyntaxNode = (value: unknown): value is SyntaxNode =>
  typeof value === "object" && value !== null && "type" in value && "start" in value;

// The node's children in source order, read through the parser's visitor keys
export const getChildren = (node: SyntaxNode): SyntaxNode[] => {
  const children = (visitorKeys[node.type] ?? []).flatMap((key) => {
    const value: unknown = Reflect.get(node, key);
    if (Array.isArray(value)) return value.filter((item) => checkIsSyntaxNode(item));
    return checkIsSyntaxNode(value) ? [value] : [];
  });
  return children.toSorted((firstChild, secondChild) => firstChild.start - secondChild.start);
};
