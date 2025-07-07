import type { PagedAsyncIterableIterator } from "@@/server/models/azure/PagedAsyncIterableIterator";
import type { BlobItem, BlockBlobClient, ContainerClient } from "@azure/storage-blob";

import { MockBlockBlobClient } from "@@/server/models/azure/container/MockBlockBlobClient";
/**
 * An in-memory mock of the Azure ContainerClient.
 * It uses a Map to simulate blob storage.
 *
 * @example
 * const mockContainerClient = new MockContainerClient('my-container');
 * const blockBlobClient = mockContainerClient.getBlockBlobClient('my-blob.txt');
 * await blockBlobClient.upload('hello world', 11);
 * const content = await blockBlobClient.downloadToBuffer();
 */
export class MockContainerClient implements ContainerClient {
  accountName = "mockaccount";
  blobs = new Map<string, Buffer>();
  containerName: string;
  url: string;

  constructor(containerName: string) {
    this.containerName = containerName;
    this.url = `https://mockaccount.blob.core.windows.net/${this.containerName}`;
  }

  getBlockBlobClient(blobName: string): BlockBlobClient {
    return new MockBlockBlobClient(this, blobName) as unknown as BlockBlobClient;
  }

  async *listBlobsFlat(): PagedAsyncIterableIterator<BlobItem> {
    for (const name of this.blobs.keys())
      yield await new Promise((resolve) =>
        resolve({
          deleted: false,
          name,
          properties: {
            contentLength: this.blobs.get(name)?.length ?? 0,
            contentType: "application/octet-stream",
            etag: `"${crypto.randomUUID()}"`,
            lastModified: new Date(),
          },
          snapshot: "",
        }),
      );
  }
  // A simple mock for uploadBlockBlob that delegates to the BlockBlobClient
  async uploadBlockBlob(blobName: string, data: any, length: number): Promise<any> {
    return this.getBlockBlobClient(blobName).upload(data, length);
  }
}
