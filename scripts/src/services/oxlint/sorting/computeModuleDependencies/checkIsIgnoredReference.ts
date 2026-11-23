import type { ClassElement } from "#src/models/oxlint/sorting/ClassElement";
import type { ESTree, Reference } from "@oxlint/plugins";

import { checkIsClassElementRelevant } from "#src/services/oxlint/sorting/computeModuleDependencies/checkIsClassElementRelevant";
import { checkIsSameNode } from "#src/services/oxlint/sorting/computeModuleDependencies/checkIsSameNode";
import { computeAncestors } from "#src/services/oxlint/sorting/computeModuleDependencies/computeAncestors";

// Whether a read is left out of a class's or an enum's dependencies: a type reference, or a read a method runs later
export const checkIsIgnoredReference = (statement: ESTree.Node, identifier: Reference["identifier"]): boolean => {
  const { parent } = identifier;
  if (parent.type === "TSTypeReference" && checkIsSameNode(parent.typeName, identifier)) return true;
  return !computeAncestors(
    identifier,
    statement,
    (ancestor): ancestor is ClassElement =>
      ["AccessorProperty", "MethodDefinition", "PropertyDefinition"].includes(ancestor.type),
    false,
  ).every((element) => checkIsClassElementRelevant(element, identifier));
};
