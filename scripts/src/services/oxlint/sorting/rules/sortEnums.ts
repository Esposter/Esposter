import type { Context, ESTree, Reference, Rule } from "@oxlint/plugins";

import { buildSortingNode } from "#src/services/oxlint/sorting/buildSortingNode";
import { compareNumericOrName } from "#src/services/oxlint/sorting/compareNumericOrName";
import { computeExpressionNumberValue } from "#src/services/oxlint/sorting/computeExpressionNumberValue";
import { computeSortingDependencies } from "#src/services/oxlint/sorting/computeSortingDependencies";
import { getOxlintDisabledLines } from "#src/services/oxlint/sorting/getOxlintDisabledLines";
import { reportSortingPartitions } from "#src/services/oxlint/sorting/reportSortingPartitions";
import { takeOne } from "@esposter/shared";
import { defineRule } from "@oxlint/plugins";

// The names read off the enum's own name by consecutive member accesses, `Enum.Member` reading the member `Member`
const computeMemberAccessNames = (identifier: Reference["identifier"], referencingNode: ESTree.Node): string[] => {
  const names: string[] = [];
  let current = identifier.parent;
  while (current && current !== referencingNode && current.type === "MemberExpression") {
    const { property } = current;
    if (property.type === "Identifier") names.push(property.name);
    else if (property.type === "Literal" && typeof property.value === "string") names.push(property.value);
    current = current.parent;
  }
  return names;
};

// An enum whose every member has an initializer, sorted by its numeric values when every one of them is a number, and
// By name otherwise. A member may read another member, which then sorts after it
const sortEnums: Rule = defineRule({
  create(context: Context) {
    const { sourceCode } = context;
    const disabledLines = getOxlintDisabledLines(context, "sort-enums");
    return {
      TSEnumDeclaration(node) {
        const members = node.body.members;
        if (members.length < 2 || members.some(({ initializer }) => !initializer)) return;
        const enumName = node.id.name;
        const membersWithValues = members.map((member) => ({
          member,
          numericValue: member.initializer ? computeExpressionNumberValue(member.initializer) : undefined,
        }));
        const isNumericEnum = membersWithValues.every(({ numericValue }) => numericValue !== undefined);
        const sortingNodes = membersWithValues.map(({ member, numericValue }) =>
          buildSortingNode(member.id.type === "Literal" ? member.id.value : sourceCode.getText(member.id), member, {
            evaluated: [member.initializer],
            isOxlintDisabled: disabledLines.has(member.loc.start.line),
            value: numericValue?.toString() ?? "",
          }),
        );
        const partition = takeOne(
          computeSortingDependencies(context, [sortingNodes], {
            ignoreDeferredFunctions: false,
            memberNames: (referencingNode, identifier) =>
              identifier.name === enumName ? computeMemberAccessNames(identifier, referencingNode) : [],
          }),
        );
        reportSortingPartitions(context, [partition], compareNumericOrName(isNumericEnum), false);
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortEnums;
