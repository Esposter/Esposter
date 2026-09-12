import type { ESTree } from "@oxlint/plugins";

import { FunctionNodeTypes } from "#src/services/oxlint/persistThenNotify/constants";

// Everything a function reaches without crossing into a nested one; `select` decides what a node contributes,
// And returning a value stops the descent there. The two stop rules are what every caller needs held: a nested
// Function's body belongs to that function, not this one, and nodes carry a `parent` backreference that cycles.
export const collectOwnNodes = <T>(value: unknown, select: (node: ESTree.Node) => T[] | undefined): T[] => {
  if (Array.isArray(value)) return value.flatMap((item) => collectOwnNodes(item, select));
  if (value === null || typeof value !== "object") return [];
  const node = value as ESTree.Node;
  if (typeof node.type !== "string" || FunctionNodeTypes.has(node.type)) return [];
  const selected = select(node);
  if (selected) return selected;
  return Object.entries(node).flatMap(([key, child]) => (key === "parent" ? [] : collectOwnNodes(child, select)));
};
