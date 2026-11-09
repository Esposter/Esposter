import type { Rule } from "@oxlint/plugins";

import { buildUnreadRemovalFix } from "#src/services/oxlint/propsInterface/buildUnreadRemovalFix";
import { checkIsDefinePropsDeclarator } from "#src/services/oxlint/propsInterface/checkIsDefinePropsDeclarator";
import { checkIsUnreadProperty } from "#src/services/oxlint/propsInterface/checkIsUnreadProperty";
import { buildUnreadDestructureMessage } from "#src/services/oxlint/propsInterface/constants";
import { defineRule } from "@oxlint/plugins";

// A prop the script never reads is not destructured: a template reads a prop by its bare name whether or not the script
// Binds it, so the binding is only weight in the script. The read question is answered by the scope manager's references,
// So the rule needs no list of names and no type information.
export const noUnreadDestructure: Rule = defineRule({
  create(context) {
    const { sourceCode } = context;
    return {
      VariableDeclaration(node) {
        for (const declarator of node.declarations) {
          if (!checkIsDefinePropsDeclarator(declarator)) continue;
          const variables = sourceCode.getDeclaredVariables(declarator);
          const unreadProperties = declarator.id.properties.filter((property) =>
            checkIsUnreadProperty(property, variables),
          );
          for (const property of unreadProperties)
            context.report({
              fix: (fixer) => buildUnreadRemovalFix(fixer, sourceCode, node, declarator, unreadProperties),
              message: buildUnreadDestructureMessage(property.value.name),
              node: property,
            });
        }
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});
