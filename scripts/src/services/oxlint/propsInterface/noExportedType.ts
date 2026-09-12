import type { Rule } from "@oxlint/plugins";

import { EXPORTED_TYPE_MESSAGE } from "#src/services/oxlint/propsInterface/constants";
import { defineRule } from "@oxlint/plugins";

export const noExportedType: Rule = defineRule({
  create(context) {
    return {
      // `export default interface Foo {}` — unreachable in `<script setup>`, but an SFC may carry a plain
      // `<script>` block beside it, and the rule is about the export rather than about which block it sits in
      // `export type * from "./types"` hands out every type the module names, without naming one here
      ExportAllDeclaration(node) {
        if (node.exportKind === "type") context.report({ message: EXPORTED_TYPE_MESSAGE, node });
      },
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === "TSInterfaceDeclaration")
          context.report({ message: EXPORTED_TYPE_MESSAGE, node: node.declaration });
      },
      ExportNamedDeclaration(node) {
        const { declaration } = node;
        if (
          declaration?.type === "TSInterfaceDeclaration" ||
          declaration?.type === "TSTypeAliasDeclaration" ||
          declaration?.type === "TSEnumDeclaration"
        ) {
          context.report({ message: EXPORTED_TYPE_MESSAGE, node: declaration });
          return;
        }
        // `export type { Foo }` marks the statement, `export { type Foo }` marks the specifier — a re-export
        // Hands the type out exactly as a declaration would, so neither spelling is a way around the rule
        for (const specifier of node.specifiers)
          if (node.exportKind === "type" || specifier.exportKind === "type")
            context.report({ message: EXPORTED_TYPE_MESSAGE, node: specifier });
      },
    };
  },
  meta: { type: "suggestion" },
});
