import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";
import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { buildBlueprintEntryToken } from "#shared/services/resource/blueprint/buildBlueprintEntryToken";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { createInvalidBlueprintError } from "@@/server/services/blueprint/createInvalidBlueprintError";
import { getBlueprintEntryKeys } from "@@/server/services/blueprint/getBlueprintEntryKeys";
import { rewriteIdsToAliases } from "@@/server/services/blueprint/rewriteIdsToAliases";
import { createResourceRow } from "@@/server/services/resource/createResourceRow";
import { deleteCreatedResources } from "@@/server/services/resource/deleteCreatedResources";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { AzureContainer, DatabaseEntityType, resources, ResourceType } from "@esposter/db-schema";
import { getResultAsync, noop, NotFoundError, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";

// Reads each selected resource's working content (owner-gated), rewrites every cross-resource id between
// The selection to a `{{entry:key}}` alias, and writes the set into a new Blueprint resource. Captured
// Content is a copy: later edits to the source resources never change the blueprint
export const captureBlueprint = async (ctx: AuthedContext, ids: Resource["id"][], name: string): Promise<Resource> => {
  const ownedResources = await ctx.db
    .select()
    .from(resources)
    .where(and(inArray(resources.id, ids), eq(resources.userId, ctx.getSessionPayload.user.id)));
  // Every id must be the caller's own resource — otherwise capture would read content across accounts
  if (ownedResources.length !== ids.length) throw new TRPCError({ code: "UNAUTHORIZED" });

  // A binned resource is still the caller's own, so it is bad input rather than an authorization failure:
  // The fix is restoring it, which a blanket UNAUTHORIZED would never tell them
  const deletedResource = ownedResources.find(({ deletedAt }) => deletedAt !== null);
  if (deletedResource) throw createInvalidBlueprintError(`cannot capture deleted resource ${deletedResource.name}`);

  // The caller's selection order drives key derivation, so a given selection always captures identically
  const resourceById = new Map(ownedResources.map((resource) => [resource.id, resource]));
  const orderedResources = ids.map((id) => {
    const resource = resourceById.get(id);
    // The ownership check above already proved every id is present, so this only narrows the map read — it
    // Is deliberately not a second authorization gate that weakening that check could silently pass
    if (!resource) throw new NotFoundError(DatabaseEntityType.Resource, id);
    return resource;
  });
  const keys = getBlueprintEntryKeys(orderedResources.map(({ name: resourceName }) => resourceName));
  const captures = orderedResources.map((resource, index) => ({ key: takeOne(keys, index), resource }));
  const idToAlias = new Map(captures.map(({ key, resource }) => [resource.id, buildBlueprintEntryToken(key)]));
  const entries = await Promise.all(
    captures.map(async ({ key, resource }): Promise<BlueprintEntry> => {
      // A resource whose content blob was never written captures as an entry with no content, which deploys
      // To a resource with no content blob — the same state the source is in. Standing an empty object in
      // Instead would poison the whole manifest, since most types' schemas reject one and a single
      // Unparseable entry rejects every deploy
      const content = await readResourceContent(ResourceDefinitionMap[resource.type].contentSchema, resource.id);
      return {
        content: rewriteIdsToAliases({ content, type: resource.type }, idToAlias),
        key,
        name: resource.name,
        type: resource.type,
      };
    }),
  );
  const manifest: BlueprintResource = { entries, parameters: [] };
  const newBlueprint = await createResourceRow(ctx, { name, type: ResourceType.Blueprint });
  await getResultAsync(() =>
    useUpload(AzureContainer.ResourceAssets, getContentBlobName(newBlueprint.id), JSON.stringify(manifest)),
  ).match(noop, async (error) => {
    // The manifest is the blueprint's entire content, so never leave a row pointing at a manifest that
    // Does not exist — nor, when the upload failed after committing, a manifest blob no row can reach
    await deleteCreatedResources(ctx, [newBlueprint.id]);
    throw error;
  });
  return newBlueprint;
};
