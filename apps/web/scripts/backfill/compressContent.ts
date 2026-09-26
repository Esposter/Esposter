import type { BlobItem, ContainerClient } from "@azure/storage-blob";

import { BlobServiceClient } from "@azure/storage-blob";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { checkIsPreconditionFailed, getContentBlobName, writeResourceContentBlob } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, settleAll } from "@esposter/shared";
import { config } from "dotenv";

// One-off: rewrites every working copy stored before the content blob became a zstd frame, run once per storage
// Account straight after the deploy that ships the readers, then deleted (/docs/resource/compressed-content-at-rest).
// Resumable and safe beside live saves: a blob already marked zstd is skipped, and both the read and the write are
// Conditioned on the etag the listing saw, so a save landing in between wins and its own write is already compressed.
// Each rewrite raises its own BlobCreated, which moves the owner's quota to the compressed length
const compressContentBlob = (containerClient: ContainerClient, resourceId: string, etag: string) => {
  const blockBlobClient = containerClient.getBlockBlobClient(getContentBlobName(resourceId));
  const conditions = { ifMatch: etag };
  return getResultAsync(async () => {
    const serializedContent = await blockBlobClient.downloadToBuffer(0, undefined, { conditions });
    await writeResourceContentBlob(containerClient, resourceId, serializedContent.toString(), conditions);
  }).match(
    () => true,
    (error) => {
      if (checkIsPreconditionFailed(error)) return false;
      throw error;
    },
  );
};

config();
const containerClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING,
).getContainerClient(AzureContainer.ResourceAssets);
const plainContentBlobItems: (BlobItem & { resourceId: string })[] = [];
for await (const { segment } of containerClient.listBlobsFlat().byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
  for (const blobItem of segment.blobItems) {
    const [resourceId = ""] = blobItem.name.split("/");
    if (blobItem.name === getContentBlobName(resourceId) && blobItem.properties.contentEncoding !== "zstd")
      plainContentBlobItems.push({ ...blobItem, resourceId });
  }

// A wave at a time: each rewrite holds a whole document, up to MAX_RESOURCE_CONTENT_SIZE, in memory
const isCompressedList = await settleAll(
  plainContentBlobItems.map(
    ({ properties, resourceId }) =>
      () =>
        compressContentBlob(containerClient, resourceId, properties.etag),
  ),
  16,
);
const compressedCount = isCompressedList.filter(Boolean).length;
console.log(
  `Compressed ${compressedCount} content blobs, left ${isCompressedList.length - compressedCount} a save had already rewritten`,
);
