import { BLUEPRINT_ENTRY_TOKEN_REGEX } from "#shared/services/resource/blueprint/constants";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";

// Replaces every `{{entry:key}}` with the created resource id of that alias — the late-bound cross-resource
// Link. Topological create order guarantees every referenced alias is already in `aliasToId` by this point
export const substituteBlueprintEntryAliases = (value: unknown, aliasToId: Record<string, string>): unknown =>
  deepReplaceStrings(value, (string) =>
    string.replace(BLUEPRINT_ENTRY_TOKEN_REGEX, (match, key: string) => aliasToId[key] ?? match),
  );
