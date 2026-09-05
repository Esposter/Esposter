import type { BlueprintDeployment } from "#shared/models/resource/blueprint/BlueprintDeployment";
import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

import { mapBlueprintEntryContentStrings } from "@@/server/services/blueprint/mapBlueprintEntryContentStrings";
import { sortBlueprintEntriesTopologically } from "@@/server/services/blueprint/sortBlueprintEntriesTopologically";
import { substituteBlueprintEntryAliasTokens } from "@@/server/services/blueprint/substituteBlueprintEntryAliasTokens";
import { substituteBlueprintParameterTokens } from "@@/server/services/blueprint/substituteBlueprintParameterTokens";
import { validateBlueprintEntries } from "@@/server/services/blueprint/validateBlueprintEntries";
import { createResourceRow } from "@@/server/services/resource/createResourceRow";
import { saveResourceContent } from "@@/server/services/resource/saveResourceContent";
import { withResourceRollback } from "@@/server/services/resource/withResourceRollback";

// Every entry is validated against its type's contentSchema before anything is created, then created
// Dependencies-first so an entry's `{{entry:key}}` references resolve to real ids. A mid-deploy failure deletes
// The rows and blobs it already created — best-effort all-or-nothing
export const deployBlueprint = async (
  ctx: AuthedContext,
  blueprint: BlueprintResource,
  parameterValues: Record<string, string>,
): Promise<BlueprintDeployment[]> => {
  // Deploy-time values override the manifest defaults, so an omitted parameter still resolves to its default
  const resolvedParameters = new Map([
    ...blueprint.parameters.map(({ defaultValue, key }) => [key, defaultValue] as const),
    ...Object.entries(parameterValues),
  ]);
  const substitutedEntries = blueprint.entries.map((entry) => ({
    ...entry,
    content: mapBlueprintEntryContentStrings(entry, (value) =>
      substituteBlueprintParameterTokens(value, resolvedParameters),
    ),
    name: substituteBlueprintParameterTokens(entry.name, resolvedParameters),
  }));
  const keyReferencesMap = validateBlueprintEntries(substitutedEntries);
  const sortedEntries = sortBlueprintEntriesTopologically(substitutedEntries, keyReferencesMap);
  const aliasIdMap = new Map<string, string>();
  const createdIds: string[] = [];
  const deployments: BlueprintDeployment[] = [];
  await withResourceRollback(ctx, createdIds, async () => {
    for (const entry of sortedEntries) {
      const newResource = await createResourceRow(ctx, { name: entry.name, type: entry.type });
      createdIds.push(newResource.id);
      aliasIdMap.set(entry.key, newResource.id);
      deployments.push({ key: entry.key, resource: newResource });
      // An entry captured from a resource whose content was never written deploys to that same state — the
      // Content blob is written on first save, so a freshly created resource simply has none
      if (entry.content === undefined) continue;
      // Real ids are known only after every dependency is created, so the content is bound here rather than up front
      const content = mapBlueprintEntryContentStrings(entry, (value) =>
        substituteBlueprintEntryAliasTokens(value, aliasIdMap),
      );
      // The one content-write path the editor's save takes, so a deployed resource is never missing the side
      // Effects its content declares — scheduling a TodoList's reminders, and whatever a type registers later.
      // No activityType: createResourceRow has already opened this resource's trail with its Created entry,
      // And a ContentSaved beside it would claim the owner edited a resource they have not opened yet
      await saveResourceContent(ctx, { content, resource: newResource });
    }
  });
  return deployments;
};
