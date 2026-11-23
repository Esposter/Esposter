import type { ESTree, SourceCode } from "@oxlint/plugins";

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
  switch (identifier.type) {
    case "Identifier":
      return identifier.name;
    case "Literal":
      return String(identifier.value);
    default:
      return sourceCode.getText(identifier);
  }
};
