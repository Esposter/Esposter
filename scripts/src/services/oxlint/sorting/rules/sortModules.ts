import type { Context, ESTree, Rule } from "@oxlint/plugins";

import { collectModuleItems } from "#src/services/oxlint/sorting/collectModuleItems";
import { computeModuleDependencies } from "#src/services/oxlint/sorting/computeModuleDependencies";
import { reportUnsortedByGroup } from "#src/services/oxlint/sorting/reportUnsortedByGroup";
import { defineRule } from "@oxlint/plugins";

// Each partition of a module's declarations sorts by group, then name, then what it reads, and the namespaces and
// Ambient modules inside it sort as modules of their own
const reportModuleBody = (context: Context, statements: ESTree.Program["body"]): void => {
  const { moduleBodies, partitions } = collectModuleItems(statements);
  for (const partition of partitions) reportUnsortedByGroup(context, computeModuleDependencies(context, partition));
  for (const moduleBody of moduleBodies) reportModuleBody(context, moduleBody);
};

const sortModules: Rule = defineRule({
  create(context) {
    return {
      Program(program) {
        reportModuleBody(context, program.body);
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortModules;
