import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";
import type { Context, ESTree, Rule } from "@oxlint/plugins";

import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { splitRuns } from "#src/services/oxlint/sorting/splitRuns";
import { withEvaluated } from "#src/services/oxlint/sorting/withEvaluated";
import { defineRule } from "@oxlint/plugins";

const computeArrayElements = (
  node: ESTree.ArrayExpression | ESTree.NewExpression,
): (ESTree.Node | null)[] | undefined => {
  if (node.type === "ArrayExpression") return node.elements;
  if (node.callee.type === "Identifier" && node.callee.name === "Array") return node.arguments;
  return undefined;
};

// Sorts the elements of an array literal or of `new Array(...)`, one run at a time: a spread element ends a run, and a
// Hole is skipped. A literal sorts by its value, anything else by its source text. The elements are evaluated where
// They sit when `evaluatesElements` is set, so an impure one keeps its place
export const reportArrayLiteral = (
  context: Context,
  node: ESTree.ArrayExpression | ESTree.NewExpression,
  evaluatesElements: boolean,
): void => {
  const elements = computeArrayElements(node);
  if (elements === undefined || elements.length < 2) return;
  const runs = splitRuns(elements, (element) => element?.type === "SpreadElement");
  for (const run of runs) {
    const items = run.flatMap((element): SortingItem[] =>
      element === null || element.type === "SpreadElement"
        ? []
        : [
            {
              ...withEvaluated(evaluatesElements ? element : undefined),
              name: element.type === "Literal" ? String(element.value) : context.sourceCode.getText(element),
              node: element,
            },
          ],
    );
    reportUnsorted(context, items);
  }
};

export const defineArrayLiteralRule = (
  checkIsSortedArray: (node: ESTree.ArrayExpression | ESTree.NewExpression) => boolean,
  evaluatesElements: boolean,
): Rule =>
  defineRule({
    create(context) {
      const reportIfSorted = (node: ESTree.ArrayExpression | ESTree.NewExpression): void => {
        if (checkIsSortedArray(node)) reportArrayLiteral(context, node, evaluatesElements);
      };
      return { ArrayExpression: reportIfSorted, NewExpression: reportIfSorted };
    },
    meta: { fixable: "code", type: "suggestion" },
  });
