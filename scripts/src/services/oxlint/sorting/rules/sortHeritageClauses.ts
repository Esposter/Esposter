import type { Context, ESTree, Rule } from "@oxlint/plugins";

import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { defineRule } from "@oxlint/plugins";

// A class's implemented interfaces and an interface's extended interfaces, by the name each one ends in (`ns.Base`
// Sorts as `Base`)
const sortHeritageClauses: Rule = defineRule({
  create(context) {
    const reportHeritageClauses = (clauses: (ESTree.TSClassImplements | ESTree.TSInterfaceHeritage)[]): void => {
      reportUnsorted(
        context,
        clauses.map((clause) => ({ name: computeHeritageName(context, clause.expression), node: clause })),
      );
    };
    const reportClass = (node: ESTree.Class): void => {
      reportHeritageClauses(node.implements ?? []);
    };
    return {
      ClassDeclaration: reportClass,
      ClassExpression: reportClass,
      TSInterfaceDeclaration(node) {
        reportHeritageClauses(node.extends);
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

const computeHeritageName = (context: Context, expression: ESTree.Node): string => {
  if ("property" in expression) return computeHeritageName(context, expression.property);
  return expression.type === "Identifier" ? expression.name : context.sourceCode.getText(expression);
};

export default sortHeritageClauses;
