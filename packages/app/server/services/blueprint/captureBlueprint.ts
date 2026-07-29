import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";
import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { buildBlueprintEntryToken } from "#shared/services/resource/blueprint/buildBlueprintEntryToken";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { getBlueprintEntryKeys } from "@@/server/services/blueprint/getBlueprintEntryKeys";
import { rewriteIdsToAliases } from "@@/server/services/blueprint/rewriteIdsToAliases";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { AzureContainer, DatabaseEntityType, resources, ResourceType } from "@esposter/db-schema";
import { getResultAsync, noop, Operation, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull } from "drizzle-orm";

// Reads each selected resource's working content (owner-gated), rewrites every cross-resource id between
// The selection to a `{{entry:key}}` alias, and writes the set into a new Blueprint resource. Captured
// Content is a copy: later edits to the source resources never change the blueprint
export const captureBlueprint = async (ctx: AuthedContext, ids: Resource["id"][], name: string): Promise<Resource> => {
  const userId = ctx.getSessionPayload.user.id;
  const ownedResources = await ctx.db
    .select()
    .from(resources)
    .where(and(inArray(resources.id, ids), eq(resources.userId, userId), isNull(resources.deletedAt)));
  // Every id must be the caller's own live resource — otherwise capture would read content across accounts
  if (ownedResources.length !== ids.length) throw new TRPCError({ code: "UNAUTHORIZED" });

  // The caller's selection order drives key derivation, so a given selection always captures identically
  const resourceById = new Map(ownedResources.map((resource) => [resource.id, resource]));
  const orderedResources = ids.map((id) => {
    const resource = resourceById.get(id);
    if (!resource) throw new TRPCError({ code: "UNAUTHORIZED" });
    return resource;
  });
  const keys = getBlueprintEntryKeys(orderedResources.map(({ name: resourceName }) => resourceName));
  const captures = orderedResources.map((resource, index) => ({ key: takeOne(keys, index), resource }));
  const idToAlias = new Map(captures.map(({ key, resource }) => [resource.id, buildBlueprintEntryToken(key)]));
  const entries = await Promise.all(
    captures.map(async ({ key, resource }): Promise<BlueprintEntry> => {
      // A resource whose content blob was never written captures as an empty object, which every type's
      // Schema fills with its own defaults on deploy — a content-less source deploys to a default resource
      const content =
        (await readResourceContent(ResourceDefinitionMap[resource.type].contentSchema, resource.id)) ?? {};
      return { content: rewriteIdsToAliases(content, idToAlias), key, name: resource.name, type: resource.type };
    }),
  );
  const manifest: BlueprintResource = { entries, parameters: [] };
  const newBlueprint = requireMutation(
    (await ctx.db.insert(resources).values({ name, type: ResourceType.Blueprint, userId }).returning())[0],
    Operation.Create,
    DatabaseEntityType.Resource,
    userId,
  );
  await getResultAsync(() =>
    useUpload(AzureContainer.ResourceAssets, getContentBlobName(newBlueprint.id), JSON.stringify(manifest)),
  ).match(noop, async (error) => {
    // The manifest is the blueprint's entire content, so never leave a row pointing at a manifest that
    // Does not exist
    await ctx.db.delete(resources).where(eq(resources.id, newBlueprint.id));
    throw error;
  });
  return newBlueprint;
};
