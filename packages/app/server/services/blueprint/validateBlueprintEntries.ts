import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { blueprintEntrySchema } from "#shared/models/resource/blueprint/BlueprintEntry";
import { BLUEPRINT_ENTRY_TOKEN_REGEX } from "#shared/services/resource/blueprint/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getInvalidBlueprintError } from "@@/server/services/blueprint/getInvalidBlueprintError";
import { mapBlueprintEntryContentStrings } from "@@/server/services/blueprint/mapBlueprintEntryContentStrings";

// Pre-validates every substituted entry — its name against the resource name rules, and its content against
// Its type's own contentSchema with a placeholder id standing in for each `{{entry:key}}` so uuid-shaped
// Bindings pass — so a manifest can never deploy a name or content the type's own write path would reject.
// Runs before anything is created, so a bad entry rejects the whole deploy rather than failing mid-loop
// Against a database constraint. The same walk that swaps in the placeholders is the one that sees every
// `{{entry:key}}`, so the dependency edges are returned from here rather than rediscovered by a second walk.
// An entry with no content captured a resource whose content was never written and deploys to that same
// State, so there is nothing to validate against the type's schema
export const validateBlueprintEntries = (entries: BlueprintEntry[]): Map<BlueprintEntry["key"], string[]> => {
  const placeholderId = crypto.randomUUID();
  const keyReferencesMap = new Map<BlueprintEntry["key"], string[]>();
  for (const entry of entries) {
    if (!blueprintEntrySchema.shape.name.safeParse(entry.name).success)
      throw getInvalidBlueprintError(`invalid name for entry ${entry.key}`);

    const references = new Set<string>();
    const content = mapBlueprintEntryContentStrings(entry, (value) =>
      value.replace(BLUEPRINT_ENTRY_TOKEN_REGEX, (_match, key: string) => {
        references.add(key);
        return placeholderId;
      }),
    );
    keyReferencesMap.set(entry.key, [...references]);
    if (entry.content === undefined) continue;

    const { contentSchema } = ResourceDefinitionMap[entry.type];
    if (!contentSchema.safeParse(content).success)
      throw getInvalidBlueprintError(`invalid content for entry ${entry.key}`);
  }
  return keyReferencesMap;
};
