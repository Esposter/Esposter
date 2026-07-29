import type { BlueprintDeployment } from "#shared/models/resource/blueprint/BlueprintDeployment";
import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { deleteBlueprintResources } from "@@/server/services/blueprint/deleteBlueprintResources";
import { mapBlueprintEntryContentStrings } from "@@/server/services/blueprint/mapBlueprintEntryContentStrings";
import { sortBlueprintEntriesTopologically } from "@@/server/services/blueprint/sortBlueprintEntriesTopologically";
import { substituteBlueprintEntryAliasTokens } from "@@/server/services/blueprint/substituteBlueprintEntryAliasTokens";
import { substituteBlueprintParameterTokens } from "@@/server/services/blueprint/substituteBlueprintParameterTokens";
import { validateBlueprintEntries } from "@@/server/services/blueprint/validateBlueprintEntries";
import { createResourceRow } from "@@/server/services/resource/createResourceRow";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { runAfterSaveResourceContent } from "@@/server/services/resource/runAfterSaveResourceContent";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Substitute parameters → pre-validate every entry against its type's contentSchema → topologically create
// Each entry (resources row + content blob) with real ids substituted for its `{{entry:key}}` references.
// A mid-deploy failure deletes the rows and blobs it already created — best-effort all-or-nothing
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
  const referencesByKey = validateBlueprintEntries(substitutedEntries);
  const sortedEntries = sortBlueprintEntriesTopologically(substitutedEntries, referencesByKey);
  const aliasToId = new Map<string, string>();
  const createdIds: string[] = [];
  const deployments: BlueprintDeployment[] = [];
  await getResultAsync(async () => {
    for (const entry of sortedEntries) {
      const newResource = await createResourceRow(ctx, { name: entry.name, type: entry.type });
      createdIds.push(newResource.id);
      aliasToId.set(entry.key, newResource.id);
      deployments.push({ key: entry.key, resource: newResource });
      // An entry captured from a resource whose content was never written deploys to that same state — the
      // Content blob is written on first save, so a freshly created resource simply has none
      if (entry.content === undefined) continue;

      // Real ids are known only after every dependency is created, so the content is bound here rather than up front
      const content = mapBlueprintEntryContentStrings(entry, (value) =>
        substituteBlueprintEntryAliasTokens(value, aliasToId),
      );
      await useUpload(AzureContainer.ResourceAssets, getContentBlobName(newResource.id), JSON.stringify(content));
      // The same hook the editor's save fires (scheduling a TodoList's reminders, and whatever a type
      // Registers later), so a deployed resource is never missing the side effects its content declares
      runAfterSaveResourceContent(ctx, newResource, content);
    }
  }).match(noop, async (error) => {
    await deleteBlueprintResources(ctx, createdIds);
    throw error;
  });
  return deployments;
};
