import type { Rule } from "@oxlint/plugins";

import { checkIsSiteNameSpelled } from "#src/services/oxlint/naming/checkIsSiteNameSpelled";
import { MODULE_SOURCE_PARENT_TYPES, SITE_NAME_LITERAL_MESSAGE } from "#src/services/oxlint/naming/constants";
import { defineRule } from "@oxlint/plugins";

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
        // The text the template evaluates to, so an escape cannot hide the name; a tagged template's invalid escape has
        // None, leaving its source text
        if (checkIsSiteNameSpelled(node.value.cooked ?? node.value.raw))
          context.report({ message: SITE_NAME_LITERAL_MESSAGE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});
