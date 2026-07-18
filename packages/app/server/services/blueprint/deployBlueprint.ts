import type { BlueprintDeployment } from "#shared/models/resource/blueprint/BlueprintDeployment";
import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { deleteBlueprintDeployedResources } from "@@/server/services/blueprint/deleteBlueprintDeployedResources";
import { substituteBlueprintEntryAliases } from "@@/server/services/blueprint/substituteBlueprintEntryAliases";
import { substituteBlueprintParameters } from "@@/server/services/blueprint/substituteBlueprintParameters";
import { topoSortBlueprintEntries } from "@@/server/services/blueprint/topoSortBlueprintEntries";
import { validateBlueprintEntries } from "@@/server/services/blueprint/validateBlueprintEntries";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { AzureContainer, DatabaseEntityType, resources } from "@esposter/db-schema";
import { getResultAsync, Operation } from "@esposter/shared";

// Substitute parameters → pre-validate every entry against its type's contentSchema → topologically create
// Each entry (resources row + content blob) with real ids substituted for its `{{entry:key}}` references.
// A mid-deploy failure deletes the rows and blobs it already created — best-effort all-or-nothing
export const deployBlueprint = async (
  ctx: AuthedContext,
  blueprint: BlueprintResource,
  parameterValues: Record<string, string>,
): Promise<BlueprintDeployment[]> => {
  const userId = ctx.getSessionPayload.user.id;
  // Deploy-time values override the manifest defaults, so an omitted parameter still resolves to its default
  const resolvedParameters: Record<string, string> = {
    ...Object.fromEntries(blueprint.parameters.map(({ defaultValue, key }) => [key, defaultValue])),
    ...parameterValues,
  };
  const substitutedEntries = blueprint.entries.map((entry) => ({
    ...entry,
    content: substituteBlueprintParameters(entry.content, resolvedParameters),
    name: substituteBlueprintParameters(entry.name, resolvedParameters) as string,
  }));
  validateBlueprintEntries(substitutedEntries);
  const sortedEntries = topoSortBlueprintEntries(substitutedEntries);
  const aliasToId: Record<string, string> = {};
  const createdIds: string[] = [];
  const deployments: BlueprintDeployment[] = [];
  return getResultAsync(async () => {
    for (const entry of sortedEntries) {
      const newResource = requireMutation(
        (await ctx.db.insert(resources).values({ name: entry.name, type: entry.type, userId }).returning())[0],
        Operation.Create,
        DatabaseEntityType.Resource,
        userId,
      );
      createdIds.push(newResource.id);
      aliasToId[entry.key] = newResource.id;
      // Real ids are known only after every dependency is created, so the content is bound here rather than up front
      const content = substituteBlueprintEntryAliases(entry.content, aliasToId);
      await useUpload(AzureContainer.ResourceAssets, getContentBlobName(newResource.id), JSON.stringify(content));
      deployments.push({ key: entry.key, resource: newResource });
    }
    return deployments;
  }).match(
    (result) => result,
    async (error) => {
      await deleteBlueprintDeployedResources(ctx, createdIds);
      throw error;
    },
  );
};
