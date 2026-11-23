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
import { computePatternEvaluated } from "#src/services/oxlint/sorting/computePatternEvaluated";
import { computeSortingDependencies } from "#src/services/oxlint/sorting/computeSortingDependencies";
import { getOxlintDisabledLines } from "#src/services/oxlint/sorting/getOxlintDisabledLines";
import { reportSortingPartitions } from "#src/services/oxlint/sorting/reportSortingPartitions";
import { partitionAtBoundaries } from "#src/services/oxlint/sorting/reportSortingPartitions/partitionAtBoundaries";
import { withEvaluated } from "#src/services/oxlint/sorting/withEvaluated";
import { defineRule } from "@oxlint/plugins";

type Comparator = (left: SortingNode, right: SortingNode) => number;
type ObjectNode = ESTree.ObjectExpression | ESTree.ObjectPattern;

// A spread or rest element splits the members, each run of properties sorted on its own
const partitionProperties = (
  node: ObjectNode,
  sourceCode: Context["sourceCode"],
  disabledLines: Set<number>,
  isNumericSet: boolean,
): SortingNode[][] =>
  partitionAtBoundaries(
    [...node.properties],
    (property): property is ESTree.BindingProperty | ESTree.ObjectProperty => property.type === "Property",
    (property) => {
      const name = computeDeclarationName(property, sourceCode);
      // A computed key runs as the property is built, and a value runs with it, or for a pattern the defaults it reads
      return buildSortingNode(name, property, {
        ...(node.type === "ObjectPattern"
          ? { dependencyNames: [...new Set(computeDependencyNames(property.value))] }
          : {}),
        ...withEvaluated(
          ...(property.computed ? [property.key] : []),
          ...(node.type === "ObjectPattern" ? computePatternEvaluated(property.value) : [property.value]),
        ),
        isOxlintDisabled: disabledLines.has(property.loc.start.line),
        value: isNumericSet ? (computeExpressionNumberValue(property.value)?.toString() ?? "") : "",
      });
    },
  );

// A numeric set sorts by value, an object written to keep its order compares equal throughout, and anything else by
// Name
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
