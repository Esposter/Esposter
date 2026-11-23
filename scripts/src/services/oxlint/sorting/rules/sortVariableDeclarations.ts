import type { Rule } from "@oxlint/plugins";

import { buildSortingNode } from "#src/services/oxlint/sorting/buildSortingNode";
import { computeDeclarationName } from "#src/services/oxlint/sorting/computeDeclarationName";
import { computePatternEvaluated } from "#src/services/oxlint/sorting/computePatternEvaluated";
import { computeSortingDependencies } from "#src/services/oxlint/sorting/computeSortingDependencies";
import { getOxlintDisabledLines } from "#src/services/oxlint/sorting/getOxlintDisabledLines";
import { reportUnsortedByGroup } from "#src/services/oxlint/sorting/reportUnsortedByGroup";
import { withEvaluated } from "#src/services/oxlint/sorting/withEvaluated";
import { takeOne } from "@esposter/shared";
import { defineRule } from "@oxlint/plugins";

// A declaration's declarators by their name, each one after the declarators its initialiser and pattern read, as
// Perfectionist's experimental dependency detection orders them. A pattern is named by its source text, and an
// Initialiser or a default the pattern reads that runs code keeps its place
const sortVariableDeclarations: Rule = defineRule({
  create(context) {
    const oxlintDisabledLines = getOxlintDisabledLines(context, "sort-variable-declarations");
    return {
      VariableDeclaration(node) {
        if (node.declarations.length < 2) return;
        const declarators = node.declarations.map((declaration) =>
          buildSortingNode(computeDeclarationName(declaration, context.sourceCode), declaration, {
            ...withEvaluated(declaration.init, ...computePatternEvaluated(declaration.id)),
            isOxlintDisabled: oxlintDisabledLines.has(declaration.loc.start.line),
          }),
        );
        const sortingNodes = takeOne(
          computeSortingDependencies(context, [declarators], { ignoreDeferredFunctions: true }),
        );
        reportUnsortedByGroup(
          context,
          sortingNodes.map((sortingNode) => ({ ...sortingNode, group: "declarator", groupIndex: 0 })),
        );
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortVariableDeclarations;
