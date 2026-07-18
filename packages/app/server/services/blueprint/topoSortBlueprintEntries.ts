import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { getBlueprintEntryReferences } from "@@/server/services/blueprint/getBlueprintEntryReferences";
import { DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Orders entries dependencies-first so an entry's `{{entry:key}}` references already have created ids by
// The time it is created. A reference to a missing alias, or a cycle, is a malformed manifest and rejects
export const topoSortBlueprintEntries = (entries: BlueprintEntry[]): BlueprintEntry[] => {
  const entryByKey = new Map(entries.map((entry) => [entry.key, entry]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const sortedEntries: BlueprintEntry[] = [];
  const visit = (entry: BlueprintEntry): void => {
    if (visited.has(entry.key)) return;
    else if (visiting.has(entry.key))
      throw new InvalidOperationError(
        Operation.Create,
        DatabaseEntityType.Resource,
        `cyclic entry reference ${entry.key}`,
      );

    visiting.add(entry.key);
    for (const reference of getBlueprintEntryReferences(entry.content)) {
      const dependency = entryByKey.get(reference);
      if (!dependency)
        throw new InvalidOperationError(
          Operation.Create,
          DatabaseEntityType.Resource,
          `unknown entry reference ${reference}`,
        );

      visit(dependency);
    }
    visiting.delete(entry.key);
    visited.add(entry.key);
    sortedEntries.push(entry);
  };
  for (const entry of entries) visit(entry);
  return sortedEntries;
};
