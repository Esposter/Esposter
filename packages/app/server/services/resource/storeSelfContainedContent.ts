import type { relations, Resource } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { AzureContainer } from "@esposter/db-schema";

// The one way content taken from somewhere else becomes a resource's own working copy: every asset it
// References — working-copy or published, this resource's or another's — is cloned under `{id}/files` and the
// Embedded urls rewritten to the clones, then the result is written as the content blob.
// Every caller needs both halves and neither is optional, so they are not separately callable: a copy that
// Kept the source's urls is broken by anything the source does later — an unpublish wipes `{id}/published`
// Wholesale, and a delete takes `{id}/files` with it — and the breakage only surfaces once the reader opens
// A page whose images 404, with re-uploading every asset as the only recovery.
// The content is written back as json and never read here, so it stays `unknown` rather than generic —
// The caller's schema already narrowed it on the way in
export const storeSelfContainedContent = async (
  db: PostgresJsDatabase<typeof relations>,
  userId: string,
  id: Resource["id"],
  content: unknown,
): Promise<void> => {
  const clonedContent = await cloneContentAssets(db, userId, content, id);
  await useUpload(AzureContainer.ResourceAssets, getContentBlobName(id), JSON.stringify(clonedContent));
};
