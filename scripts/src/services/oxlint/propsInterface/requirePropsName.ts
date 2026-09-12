import type { ESTree, Rule } from "@oxlint/plugins";

import { checkIsUnderDefineProps } from "#src/services/oxlint/propsInterface/checkIsUnderDefineProps";
import { INLINE_TYPE_MESSAGE, PROPS_NAME, PROPS_NAME_MESSAGE } from "#src/services/oxlint/propsInterface/constants";
import { defineRule } from "@oxlint/plugins";

export const requirePropsName: Rule = defineRule({
  create(context) {
    const declarationMap = new Map<string, ESTree.Node>();
    const propsTypeNames = new Set<string>();
    const recordDeclaration = (node: ESTree.TSInterfaceDeclaration | ESTree.TSTypeAliasDeclaration): void => {
      declarationMap.set(node.id.name, node);
    };
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "defineProps") return;
        const type = node.typeArguments?.params[0];
        // An inline object literal is the one shape with nowhere to hang a default's comment or a prop's, and
        // It cannot be reused by the slot types beside it — the named declaration costs one line
        if (type?.type === "TSTypeLiteral") context.report({ message: INLINE_TYPE_MESSAGE, node: type });
      },
      "Program:exit"() {
        for (const name of propsTypeNames) {
          if (name === PROPS_NAME) continue;
          const declaration = declarationMap.get(name);
          // A name this file does not declare is an imported module or an external library type, which this rule
          // Has no say over — the component is using an existing shape rather than naming one
          if (declaration) context.report({ message: PROPS_NAME_MESSAGE, node: declaration });
        }
      },
      TSInterfaceDeclaration: recordDeclaration,
      TSTypeAliasDeclaration: recordDeclaration,
      TSTypeReference(node) {
        if (node.typeName.type === "Identifier" && checkIsUnderDefineProps(node))
          propsTypeNames.add(node.typeName.name);
      },
    };
  },
  meta: { type: "suggestion" },
});
