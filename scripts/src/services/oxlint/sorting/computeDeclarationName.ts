import type { ESTree, SourceCode } from "@oxlint/plugins";

import { computeKeyNameOrSource } from "#src/services/oxlint/sorting/names/computeKeyName";

// A property's key or a declarator's identifier as the name a rule sorts it by: an identifier's name, a literal's value,
// Or the source text of anything else
export const computeDeclarationName = (
  node:
    | ESTree.AssignmentTargetPropertyIdentifier
    | ESTree.AssignmentTargetPropertyProperty
    | ESTree.BindingProperty
    | ESTree.ObjectProperty
    | ESTree.VariableDeclarator,
  sourceCode: SourceCode,
): string => {
  const identifier = node.type === "VariableDeclarator" ? node.id : node.key;
  return computeKeyNameOrSource(identifier, sourceCode);
};
