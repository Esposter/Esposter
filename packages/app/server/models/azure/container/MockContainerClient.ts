import type { PagedAsyncIterableIterator } from "@@/server/models/azure/PagedAsyncIterableIterator";
import type {
  BlobItem,
  BlockBlobClient,
  BlockBlobUploadResponse,
  ContainerClient,
  ContainerListBlobFlatSegmentResponse,
  HttpRequestBody,
} from "@azure/storage-blob";

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

  constructor(_connectionString: string, containerName: string) {
    this.containerName = containerName;
    this.url = `https://mockaccount.blob.core.windows.net/${this.containerName}`;
  }

  getBlockBlobClient(blobName: string): BlockBlobClient {
    return new MockBlockBlobClient("", this, blobName) as unknown as BlockBlobClient;
  }

  async *listBlobsFlat(): PagedAsyncIterableIterator<BlobItem, ContainerListBlobFlatSegmentResponse> {
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

  async uploadBlockBlob(
    blobName: string,
    body: HttpRequestBody,
    contentLength: number,
  ): Promise<{
    blockBlobClient: BlockBlobClient;
    response: BlockBlobUploadResponse;
  }> {
    const blockBlobClient = this.getBlockBlobClient(blobName);
    return {
      blockBlobClient,
      response: await blockBlobClient.upload(body, contentLength),
    };
  }
}
