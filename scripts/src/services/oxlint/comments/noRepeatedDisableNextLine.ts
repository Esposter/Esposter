import type { Rule } from "@oxlint/plugins";

import { buildCollapseFix } from "#src/services/oxlint/comments/buildCollapseFix";
import { buildRepeatedDisableMessage } from "#src/services/oxlint/comments/constants";
import { groupNextLineRules } from "#src/services/oxlint/comments/groupNextLineRules";
import { defineRule } from "@oxlint/plugins";

// A file that disables one rule with `-next-line` on several lines repeats the same directive, where one file-level
// Directive at the top says it once. The second and later occurrences are reported, and every report carries the fix
// For the whole file, so the first one applied collapses it and the rest are identical duplicates oxlint drops.
export const noRepeatedDisableNextLine: Rule = defineRule({
  create(context) {
    const { sourceCode } = context;
    return {
      "Program:exit"() {
        const repeated = [...groupNextLineRules(sourceCode.getAllComments()).values()].filter(
          ({ directives }) => directives.length > 1,
        );
        for (const { directives, prefix, rule } of repeated)
          for (const directive of directives.slice(1))
            context.report({
              fix: (fixer) => buildCollapseFix(fixer, sourceCode.text, repeated),
              loc: directive.comment.loc,
              message: buildRepeatedDisableMessage(prefix, rule),
            });
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});
