import type { ModuleItems } from "#src/models/oxlint/sorting/ModuleItems";
import type { SortingGroupItem } from "#src/models/oxlint/sorting/SortingGroupItem";
import type { ESTree } from "@oxlint/plugins";

import { buildSortingNode } from "#src/services/oxlint/sorting/buildSortingNode";
import { describeStatement } from "#src/services/oxlint/sorting/collectModuleItems/describeStatement";
import { getGroupIndex } from "#src/services/oxlint/sorting/collectModuleItems/getGroupIndex";

// The module's declarations in partitions, and the statement lists of the namespaces and ambient modules inside it.
// A partition is never sorted across an unsortable statement, so each one is sorted apart from the others
export const collectModuleItems = (statements: ESTree.Program["body"]): ModuleItems => {
  const moduleBodies: ESTree.Program["body"][] = [];
  const partitions: SortingGroupItem[][] = [];
  let partition: SortingGroupItem[] = [];
  for (const statement of statements) {
    const description = describeStatement(statement);
    if (description === undefined) continue;
    if (description.declaration) {
      const { group, name } = description.declaration;
      // A declaration is never pinned in place: it sorts by its name within its group.
      partition.push({ ...buildSortingNode(name, statement), group, groupIndex: getGroupIndex(group) });
    }
    if (description.moduleBody) moduleBodies.push(description.moduleBody);
    if (description.endsPartition) {
      partitions.push(partition);
      partition = [];
    }
  }
  partitions.push(partition);
  return { moduleBodies, partitions };
};
