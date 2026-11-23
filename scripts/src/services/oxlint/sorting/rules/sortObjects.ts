import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";
import type { Context, ESTree, Rule } from "@oxlint/plugins";

import { buildSortingNode } from "#src/services/oxlint/sorting/buildSortingNode";
import { checkHasPropertyDependencies } from "#src/services/oxlint/sorting/checkHasPropertyDependencies";
import { checkIsNumericValueSet } from "#src/services/oxlint/sorting/checkIsNumericValueSet";
import { checkIsUnsortedObject } from "#src/services/oxlint/sorting/checkIsUnsortedObject";
import { compareNames } from "#src/services/oxlint/sorting/compareNames";
import { compareNumericOrName } from "#src/services/oxlint/sorting/compareNumericOrName";
import { computeDeclarationName } from "#src/services/oxlint/sorting/computeDeclarationName";
import { computeDependencyNames } from "#src/services/oxlint/sorting/computeDependencyNames";
import { computeExpressionNumberValue } from "#src/services/oxlint/sorting/computeExpressionNumberValue";
import { computeSortingDependencies } from "#src/services/oxlint/sorting/computeSortingDependencies";
import { getOxlintDisabledLines } from "#src/services/oxlint/sorting/getOxlintDisabledLines";
import { reportSortingPartitions } from "#src/services/oxlint/sorting/reportSortingPartitions";
import { withEvaluated } from "#src/services/oxlint/sorting/withEvaluated";
import { defineRule } from "@oxlint/plugins";

type Comparator = (left: SortingNode, right: SortingNode) => number;
type ObjectNode = ESTree.ObjectExpression | ESTree.ObjectPattern;

// The expression a property evaluates: its value, or a pattern's default, when it has one
const computePropertyEvaluated = (value: ESTree.Node, isPattern: boolean): ESTree.Node | undefined => {
  if (value.type === "AssignmentPattern") return value.right;
  return isPattern ? undefined : value;
};

// A spread or rest element splits the members, each run of properties sorted on its own
const partitionProperties = (
  node: ObjectNode,
  sourceCode: Context["sourceCode"],
  disabledLines: Set<number>,
  isNumericSet: boolean,
): SortingNode[][] => {
  const partitions: SortingNode[][] = [];
  let partition: SortingNode[] = [];
  partitions.push(partition);
  for (const property of node.properties) {
    if (property.type === "SpreadElement" || property.type === "RestElement") {
      partition = [];
      partitions.push(partition);
      continue;
    }
    partition.push(
      buildSortingNode(computeDeclarationName(property, sourceCode), property, {
        dependencyNames:
          node.type === "ObjectPattern"
            ? [...new Set(computeDependencyNames(property.value))]
            : [computeDeclarationName(property, sourceCode)],
        ...withEvaluated(computePropertyEvaluated(property.value, node.type === "ObjectPattern")),
        isOxlintDisabled: disabledLines.has(property.loc.start.line),
        value: isNumericSet ? (computeExpressionNumberValue(property.value)?.toString() ?? "") : "",
      }),
    );
  }
  return partitions;
};

// A numeric set sorts by value, an object written to keep its order compares equal throughout, and anything else by name
const computeComparator = (node: ObjectNode, sourceCode: Context["sourceCode"], isNumericSet: boolean): Comparator => {
  if (isNumericSet) return compareNumericOrName(true);
  if (checkIsUnsortedObject(node, sourceCode)) return () => 0;
  return (left, right) => compareNames(left.name, right.name);
};

// Every object literal and pattern, its members sorted by the comparer computeComparator picks for it
const sortObjects: Rule = defineRule({
  create(context) {
    const { sourceCode } = context;
    const disabledLines = getOxlintDisabledLines(context, "sort-objects");
    const checkObject = (node: ObjectNode): void => {
      if (node.properties.length < 2) return;
      const isNumericSet = node.type === "ObjectExpression" && checkIsNumericValueSet(node);
      const partitions = partitionProperties(node, sourceCode, disabledLines, isNumericSet);
      const partitionsWithDependencies =
        node.type === "ObjectPattern" && checkHasPropertyDependencies(node)
          ? computeSortingDependencies(context, partitions, { ignoreDeferredFunctions: true })
          : partitions;
      reportSortingPartitions(
        context,
        partitionsWithDependencies,
        computeComparator(node, sourceCode, isNumericSet),
        false,
      );
    };
    return { ObjectExpression: checkObject, ObjectPattern: checkObject };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortObjects;
