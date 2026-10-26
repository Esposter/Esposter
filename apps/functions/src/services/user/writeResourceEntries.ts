import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { db } from "#src/services/shared/db";
import { getResourceAssetBlobName } from "#src/services/user/getResourceAssetBlobName";
import { writeBlobEntry } from "#src/services/user/writeBlobEntry";
import { getContentBlobName, readJsonBlob } from "@esposter/db";
import { AzureContainer, FILES_DIRECTORY_SEGMENT } from "@esposter/db-schema";

// The resources the person owns, each as its record, its working copy and the assets its working copy embeds. A
// resource they only work on belongs to its owner, so it is not read here
export const writeResourceEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const resources = await db.query.resourcesInResource.findMany({ where: { userId: { eq: userId } } });
  const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
  for (const resource of resources) {
    const entryDirectory = `resources/${resource.id}`;
    await archive.addJsonEntry(`${entryDirectory}/resource.json`, resource);
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one resource at a time, as its purge runs
    const publication = await db.query.resourcePublicationsInResource.findFirst({
      columns: { publishedAt: true, publishedContentVersion: true, publishVersion: true },
      where: { resourceId: { eq: resource.id } },
    });
    if (publication) await archive.addJsonEntry(`${entryDirectory}/publications.json`, publication);
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one resource at a time, as its purge runs
    const content = await readJsonBlob(containerClient, getContentBlobName(resource.id));
    if (content) await archive.addEntry(`${entryDirectory}/content.json`, content);
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one resource at a time, as its purge runs
    const workingAssets = await db.query.resourceWorkingAssetsInResource.findMany({
      columns: { assetHash: true },
      where: { resourceId: { eq: resource.id } },
    });
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
