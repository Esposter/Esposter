import type { Rule } from "@oxlint/plugins";

import { getOxlintDisabledLines } from "#src/services/oxlint/sorting/getOxlintDisabledLines";
import { reportTypeMembers } from "#src/services/oxlint/sorting/reportTypeMembers";
import { defineRule } from "@oxlint/plugins";

// The members of an interface, sorted by name
const sortInterfaces: Rule = defineRule({
  create(context) {
    const disabledLines = getOxlintDisabledLines(context, "sort-interfaces");
    return {
      TSInterfaceDeclaration(node) {
        reportTypeMembers(context, node.body.body, disabledLines);
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortInterfaces;
