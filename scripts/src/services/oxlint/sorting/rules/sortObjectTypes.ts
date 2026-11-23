import type { Rule } from "@oxlint/plugins";

import { getOxlintDisabledLines } from "#src/services/oxlint/sorting/getOxlintDisabledLines";
import { reportTypeMembers } from "#src/services/oxlint/sorting/reportTypeMembers";
import { defineRule } from "@oxlint/plugins";

// The members of a type literal, sorted by name
const sortObjectTypes: Rule = defineRule({
  create(context) {
    const disabledLines = getOxlintDisabledLines(context, "sort-object-types");
    return {
      TSTypeLiteral(node) {
        reportTypeMembers(context, node.members, disabledLines);
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortObjectTypes;
