import { deepReplaceStrings } from "@@/server/services/blueprint/deepReplaceStrings";

// The capture rewrite: replaces any string that is exactly a selected resource's id with that resource's
// `{{entry:key}}` alias. Ids are UUIDs and cross-resource references are bare id strings, so a whole-string
// Match is both type-agnostic (any binding shape rewires for free) and safe (prose mentioning an id fragment
// Is never a whole-string match). References to unselected resources stay as raw ids
export const rewriteIdsToAliases = (value: unknown, idToAlias: Map<string, string>): unknown =>
  deepReplaceStrings(value, (string) => idToAlias.get(string) ?? string);
