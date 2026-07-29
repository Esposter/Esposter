import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { createInvalidBlueprintError } from "@@/server/services/blueprint/createInvalidBlueprintError";

// Orders entries dependencies-first so an entry's `{{entry:key}}` references already have created ids by the
// Time it is created. The edges come from the validation walk that already read every content string, so
// This is pure graph work. A reference to a missing alias, or a cycle, is a malformed manifest and rejects
export const sortBlueprintEntriesTopologically = (
  entries: BlueprintEntry[],
  referencesByKey: Map<BlueprintEntry["key"], string[]>,
): BlueprintEntry[] => {
  const entryByKey = new Map(entries.map((entry) => [entry.key, entry]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const sortedEntries: BlueprintEntry[] = [];
  const visit = (entry: BlueprintEntry): void => {
    if (visited.has(entry.key)) return;
    else if (visiting.has(entry.key)) throw createInvalidBlueprintError(`cyclic entry reference ${entry.key}`);

    visiting.add(entry.key);
    for (const reference of referencesByKey.get(entry.key) ?? []) {
      const dependency = entryByKey.get(reference);
      if (!dependency) throw createInvalidBlueprintError(`unknown entry reference ${reference}`);

      visit(dependency);
    }
    visiting.delete(entry.key);
    visited.add(entry.key);
    sortedEntries.push(entry);
  };
  for (const entry of entries) visit(entry);
  return sortedEntries;
};
