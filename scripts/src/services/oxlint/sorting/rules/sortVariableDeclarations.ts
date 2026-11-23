import type { Rule } from "@oxlint/plugins";

import { buildSortingNode } from "#src/services/oxlint/sorting/buildSortingNode";
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
    return {
      VariableDeclaration(node) {
        if (node.declarations.length < 2) return;
        const oxlintDisabledLines = getOxlintDisabledLines(context, "sort-variable-declarations");
        const declarators = node.declarations.map((declaration) => {
          const name =
            declaration.id.type === "Identifier" ? declaration.id.name : context.sourceCode.getText(declaration.id);
          return buildSortingNode(name, declaration, {
            ...withEvaluated(declaration.init, ...computePatternEvaluated(declaration.id)),
            isOxlintDisabled: oxlintDisabledLines.has(declaration.loc.start.line),
          });
        });
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
