import type { ESTree, Reference } from "@oxlint/plugins";

import { computeAncestors } from "#src/services/oxlint/sorting/computeModuleDependencies/computeAncestors";

// The names a read reaches through member access, `value.name` reading `name`, and through qualified type names
export const computeRelatedNames = (statement: ESTree.Node, identifier: Reference["identifier"]): string[] => [
  ...computeAncestors(
    identifier,
    statement,
    (ancestor): ancestor is ESTree.MemberExpression => ancestor.type === "MemberExpression",
    true,
  ).flatMap((member) => (member.property.type === "Identifier" ? [member.property.name] : [])),
  ...computeAncestors(
    identifier,
    statement,
    (ancestor): ancestor is ESTree.TSQualifiedName => ancestor.type === "TSQualifiedName",
    true,
  ).map((qualifiedName) => qualifiedName.right.name),
];
