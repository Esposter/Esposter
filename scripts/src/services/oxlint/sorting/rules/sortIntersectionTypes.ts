import type { ESTree, Rule } from "@oxlint/plugins";

import { createFirstVisitGuard } from "#src/services/oxlint/sorting/createFirstVisitGuard";
import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { defineRule } from "@oxlint/plugins";

// An intersection's members by their source text, skipping an intersection with a callable member, as
// Perfectionist's ignoreCallableTypes does by default
const sortIntersectionTypes: Rule = defineRule({
  create(context) {
    const checkIsFirstVisit = createFirstVisitGuard();
    return {
      TSIntersectionType(node) {
        if (!checkIsFirstVisit(node)) return;
        if (node.types.some((type) => checkHasCallableType(type))) return;
        reportUnsorted(
          context,
          node.types.map((type) => ({
            name: context.sourceCode.getText(type).replace(/^\s*[&|]\s*/u, ""),
            node: type,
          })),
        );
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

const checkHasCallableType = (typeNode: ESTree.TSType): boolean => {
  switch (typeNode.type) {
    case "TSConstructorType":
    case "TSFunctionType":
      return true;
    case "TSTypeLiteral":
      return typeNode.members.some((member) => checkHasCallableMember(member));
    default:
      return false;
  }
};

const checkHasCallableMember = (member: ESTree.TSSignature): boolean => {
  switch (member.type) {
    case "TSCallSignatureDeclaration":
    case "TSMethodSignature":
      return true;
    case "TSPropertySignature":
      return member.typeAnnotation ? checkHasCallableType(member.typeAnnotation.typeAnnotation) : false;
    default:
      return false;
  }
};

export default sortIntersectionTypes;
