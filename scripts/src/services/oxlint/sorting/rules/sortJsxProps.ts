import type { Context, ESTree, Rule } from "@oxlint/plugins";

import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { splitRuns } from "#src/services/oxlint/sorting/splitRuns";
import { withEvaluated } from "#src/services/oxlint/sorting/withEvaluated";
import { defineRule } from "@oxlint/plugins";

const computeJsxPropName = (context: Context, attribute: ESTree.JSXAttribute): string =>
  attribute.name.type === "JSXNamespacedName"
    ? `${attribute.name.namespace.name}:${attribute.name.name.name}`
    : context.sourceCode.getText(attribute.name);

// The expression an attribute's value evaluates, when it is written in braces
const computeJsxEvaluated = (attribute: ESTree.JSXAttribute): ESTree.Node | undefined =>
  attribute.value?.type === "JSXExpressionContainer" ? attribute.value.expression : undefined;

// A JSX element's props by their name, a namespaced prop by `namespace:name`. A spread prop ends a run of props
const sortJsxProps: Rule = defineRule({
  create(context) {
    return {
      JSXElement(node) {
        const runs = splitRuns(node.openingElement.attributes, (attribute) => attribute.type === "JSXSpreadAttribute");
        for (const run of runs)
          reportUnsorted(
            context,
            run.flatMap((attribute) =>
              attribute.type === "JSXAttribute"
                ? [
                    {
                      ...withEvaluated(computeJsxEvaluated(attribute)),
                      name: computeJsxPropName(context, attribute),
                      node: attribute,
                    },
                  ]
                : [],
            ),
          );
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortJsxProps;
