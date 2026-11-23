import type { Context, ESTree } from "@oxlint/plugins";

import { buildSortingNode } from "#src/services/oxlint/sorting/buildSortingNode";
import { compareNames } from "#src/services/oxlint/sorting/compareNames";
import { computeTypeMemberName } from "#src/services/oxlint/sorting/computeTypeMemberName";
import { reportSortingPartitions } from "#src/services/oxlint/sorting/reportSortingPartitions";
import { partitionAtBoundaries } from "#src/services/oxlint/sorting/reportSortingPartitions/partitionAtBoundaries";

// The members of an interface or a type literal, sorted by name within each run between call and construct signatures,
// Which stay where they are and split the members into partitions
export const reportTypeMembers = (
  context: Context,
  members: ESTree.TSSignature[],
  disabledLines: Set<number>,
): void => {
  if (members.length < 2) return;
  const partitions = partitionAtBoundaries(
    members,
    (member): member is ESTree.TSIndexSignature | ESTree.TSMethodSignature | ESTree.TSPropertySignature =>
      !["TSCallSignatureDeclaration", "TSConstructSignatureDeclaration"].includes(member.type),
    (member) =>
      buildSortingNode(computeTypeMemberName(member, context.sourceCode), member, {
        dependencyNames: [],
        isOxlintDisabled: disabledLines.has(member.loc.start.line),
      }),
  );
  reportSortingPartitions(context, partitions, (left, right) => compareNames(left.name, right.name), true);
};
