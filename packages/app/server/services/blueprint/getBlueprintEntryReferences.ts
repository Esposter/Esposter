import { BLUEPRINT_ENTRY_TOKEN_REGEX } from "#shared/services/resource/blueprint/constants";
import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";

// The distinct `{{entry:key}}` aliases a value references — the edges the topological create order is
// Built from. Deduped, since the same alias may be referenced by several strings in one entry
export const getBlueprintEntryReferences = (value: unknown): string[] => {
  const references = new Set<string>();
  deepVisitStrings(value, (string) => {
    for (const match of string.matchAll(BLUEPRINT_ENTRY_TOKEN_REGEX)) {
      const key = match.groups?.key;
      if (key !== undefined) references.add(key);
    }
  });
  return [...references];
};
