import type { SortingGroupItem } from "#src/models/oxlint/sorting/SortingGroupItem";
import type { ESTree } from "@oxlint/plugins";

export interface ModuleItems {
  // The statement lists of the namespaces and ambient modules inside the module, each sorted as a module of its own
  moduleBodies: ESTree.Program["body"][];
  // The declarations in partitions, each partition sorted apart from the others
  partitions: SortingGroupItem[][];
}
