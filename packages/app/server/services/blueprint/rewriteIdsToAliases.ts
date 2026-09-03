import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { mapBlueprintEntryContentStrings } from "@@/server/services/blueprint/mapBlueprintEntryContentStrings";

// The capture rewrite: replaces any string that is exactly a selected resource's id with that resource's
// `{{entry:key}}` alias. Ids are UUIDs and cross-resource references are bare id strings, so a whole-string
// Match is both type-agnostic (any binding shape rewires for free) and safe (prose mentioning an id fragment
// Is never a whole-string match). References to unselected resources stay as raw ids, and a captured
// Blueprint's own manifest is handed through untouched — its entry aliases are its own namespace
export const rewriteIdsToAliases = (
  entry: Pick<BlueprintEntry, "content" | "type">,
  idAliasMap: Map<string, string>,
): unknown => mapBlueprintEntryContentStrings(entry, (value) => idAliasMap.get(value) ?? value);
