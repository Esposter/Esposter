import type { Rule } from "@oxlint/plugins";

import {
  SITE_NAME_ALLOWED_REGEX,
  SITE_NAME_LITERAL_MESSAGE,
  SITE_NAME_REGEX,
} from "#src/services/oxlint/naming/constants";
import { defineRule } from "@oxlint/plugins";

const MODULE_SOURCE_PARENT_TYPES = new Set([
  "ExportAllDeclaration",
  "ExportNamedDeclaration",
  "ImportDeclaration",
  "ImportExpression",
]);

const checkIsSiteNameSpelled = (text: string) => SITE_NAME_REGEX.test(text) && !SITE_NAME_ALLOWED_REGEX.test(text);

export const noSiteNameLiteral: Rule = defineRule({
  create(context) {
    return {
      Literal(node) {
        if (
          typeof node.value === "string" &&
          !MODULE_SOURCE_PARENT_TYPES.has(node.parent.type) &&
          checkIsSiteNameSpelled(node.value)
        )
          context.report({ message: SITE_NAME_LITERAL_MESSAGE, node });
      },
      TemplateElement(node) {
        if (checkIsSiteNameSpelled(node.value.raw)) context.report({ message: SITE_NAME_LITERAL_MESSAGE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});
