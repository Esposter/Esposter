import type { Context, ESTree, Rule } from "@oxlint/plugins";

import { reportElementRuns } from "#src/services/oxlint/sorting/shared/reportElementRuns";
import { withEvaluated } from "#src/services/oxlint/sorting/withEvaluated";
import { defineRule } from "@oxlint/plugins";

// A hole or a spread entry ends a run
const checkIsRunBreak = (entry: ESTree.ArrayExpressionElement): entry is ESTree.SpreadElement | null =>
  entry === null || entry.type === "SpreadElement";

// The entries of `new Map([...])` by their key, the first element of each entry. Building an entry runs the expressions
// It is made of, so an entry that runs code keeps its place
const sortMaps: Rule = defineRule({
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "Map") return;
        const [entries] = node.arguments;
        if (entries?.type !== "ArrayExpression" || entries.elements.length < 2) return;
        reportElementRuns(context, entries.elements, checkIsRunBreak, (entry) => ({
          ...withEvaluated(...(entry.type === "ArrayExpression" ? entry.elements : [entry])),
          name: computeEntryKey(context, entry),
          node: entry,
        }));
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

// A key by its source text, so a literal key keeps its quotes, and an entry that is not an array by its source text
const computeEntryKey = (context: Context, entry: ESTree.Expression): string => {
  if (entry.type !== "ArrayExpression") return context.sourceCode.getText(entry);
  const [key] = entry.elements;
  if (!key) return "undefined";
  return context.sourceCode.getText(key);
};

export default sortMaps;
