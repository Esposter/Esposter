import { BLUEPRINT_ENTRY_TOKEN_REGEX } from "#shared/services/resource/blueprint/constants";

// Replaces every `{{entry:key}}` in one string with the created resource id of that alias — the late-bound
// Cross-resource link. Topological create order guarantees every referenced alias is already in `aliasToId`,
// And the sort rejects an unknown alias before anything is created, so the `?? match` fallback is only ever
// The nested-manifest case the content walk already hands through untouched
export const substituteBlueprintEntryAliasTokens = (value: string, aliasToId: Map<string, string>): string =>
  value.replace(BLUEPRINT_ENTRY_TOKEN_REGEX, (match, key: string) => aliasToId.get(key) ?? match);
