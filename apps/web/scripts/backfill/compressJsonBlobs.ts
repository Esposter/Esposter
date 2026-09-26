import type { BlobItem, ContainerClient } from "@azure/storage-blob";

import { getSaveBlobName } from "@@/server/services/blobState/getSaveBlobName";
import { BlobServiceClient } from "@azure/storage-blob";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { checkIsPreconditionFailed, getContentBlobName, writeJsonBlob } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, settleAll } from "@esposter/shared";
import { config } from "dotenv";

// Every JSON blob the app writes, by the container it lives in and the name it is written under, keyed off the
// Blob name's first segment — a resource id or a user id
const JsonBlobNameMap = {
  [AzureContainer.ClickerAssets]: getSaveBlobName,
  [AzureContainer.DungeonsAssets]: getSaveBlobName,
  [AzureContainer.ResourceAssets]: getContentBlobName,
} as const satisfies Partial<Record<AzureContainer, (id: string) => string>>;
// One-off: rewrites every JSON blob stored before JSON blobs became zstd frames, run once per storage account
// Straight after the deploy that ships the readers, then deleted (/docs/architecture/compressed-json-blobs).
// Resumable and safe beside live saves: a blob already marked zstd is skipped, and both the read and the write are
// Conditioned on the etag the listing saw, so a save landing in between wins and its own write is already compressed.
// A resource's rewrite raises its own BlobCreated, which moves the owner's quota to the compressed length
const compressJsonBlob = (containerClient: ContainerClient, { name, properties }: BlobItem) => {
  const conditions = { ifMatch: properties.etag };
  return getResultAsync(async () => {
    const serializedJson = await containerClient
      .getBlockBlobClient(name)
      .downloadToBuffer(0, undefined, { conditions });
    await writeJsonBlob(containerClient, name, serializedJson.toString(), conditions);
  }).match(
    () => true,
    (error) => {
      if (checkIsPreconditionFailed(error)) return false;
      throw error;
    },
  );
};

const readPlainJsonBlobItems = async (containerClient: ContainerClient, getJsonBlobName: (id: string) => string) => {
  const blobItems: BlobItem[] = [];
  for await (const { segment } of containerClient.listBlobsFlat().byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    for (const blobItem of segment.blobItems) {
      const [id = ""] = blobItem.name.split("/");
      if (blobItem.name === getJsonBlobName(id) && blobItem.properties.contentEncoding !== "zstd")
        blobItems.push(blobItem);
    }
  return blobItems;
};

config();
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING);
const isCompressedLists = await Promise.all(
  Object.entries(JsonBlobNameMap).map(async ([azureContainer, getJsonBlobName]) => {
    const containerClient = blobServiceClient.getContainerClient(azureContainer);
    const blobItems = await readPlainJsonBlobItems(containerClient, getJsonBlobName);
    // A wave at a time: each rewrite holds a whole document, up to MAX_RESOURCE_CONTENT_SIZE, in memory
    return settleAll(
      blobItems.map((blobItem) => () => compressJsonBlob(containerClient, blobItem)),
      16,
    );
  }),
);
const isCompressedList = isCompressedLists.flat();
const compressedCount = isCompressedList.filter(Boolean).length;
console.log(
  `Compressed ${compressedCount} JSON blobs, left ${isCompressedList.length - compressedCount} a save had already rewritten`,
);
