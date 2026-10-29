import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { db } from "#src/services/shared/db";
import { getResourceAssetBlobName } from "#src/services/user/getResourceAssetBlobName";
import { writeBlobEntry } from "#src/services/user/writeBlobEntry";
import { getContentBlobName, readJsonBlob } from "@esposter/db";
import { AzureContainer, FILES_DIRECTORY_SEGMENT } from "@esposter/db-schema";

// Each resource the person owns is written as its record, its working copy and the assets that copy embeds.
// Its publication, when it is published, and the links it holds are written too.
// The record is the fields the person wrote and the time it was created.
// The hashes, sizes and revision counters are the store's bookkeeping, and no update or delete time is the person's.
// A resource they only work on belongs to its owner, so it is not read here
export const writeResourceEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const resources = await db.query.resourcesInResource.findMany({
    columns: { contentVersion: true, createdAt: true, id: true, name: true, tags: true, type: true },
    where: { userId: { eq: userId } },
  });
  const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
  for (const resource of resources) {
    const entryDirectory = `resources/${resource.id}`;
    // oxlint-disable-next-line no-await-in-loop -- The archive takes one entry at a time, so its entries stay in order
    await archive.addJsonEntry(`${entryDirectory}/resource.json`, resource);
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one resource at a time, as its purge runs
    const [publication, links, content, workingAssets] = await Promise.all([
      db.query.resourcePublicationsInResource.findFirst({
        columns: { createdAt: true, publishedAt: true, publishedContentVersion: true, publishVersion: true },
        where: { resourceId: { eq: resource.id } },
      }),
      db.query.resourceLinksInResource.findMany({
        columns: { sourceId: true, targetId: true, type: true },
        where: { sourceId: { eq: resource.id } },
      }),
      readJsonBlob(containerClient, getContentBlobName(resource.id)),
      db.query.resourceWorkingAssetsInResource.findMany({
        columns: { assetHash: true },
        where: { resourceId: { eq: resource.id } },
      }),
    ]);
    // oxlint-disable-next-line no-await-in-loop -- The archive takes one entry at a time, so its entries stay in order
    if (publication) await archive.addJsonEntry(`${entryDirectory}/publications.json`, publication);
    // oxlint-disable-next-line no-await-in-loop -- The archive takes one entry at a time, so its entries stay in order
    if (links.length > 0) await archive.addJsonEntry(`${entryDirectory}/links.json`, links);
    // oxlint-disable-next-line no-await-in-loop -- The archive takes one entry at a time, so its entries stay in order
    if (content) await archive.addEntry(`${entryDirectory}/content.json`, content);
    for (const { assetHash } of workingAssets)
      // oxlint-disable-next-line no-await-in-loop -- One asset at a time, streamed as it is read
      await writeBlobEntry(
        archive,
        `${entryDirectory}/${FILES_DIRECTORY_SEGMENT}/${assetHash}`,
        containerClient,
        getResourceAssetBlobName(resource.id, assetHash),
      );
  }
};
