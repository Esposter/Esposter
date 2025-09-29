import type { BlobHierarchyItem } from "@/models/BlobHierarchyItem";
import type { PagedAsyncIterableIterator } from "@/models/PagedAsyncIterableIterator";
import type {
  AppendBlobClient,
  BlobBatchClient,
  BlobClient,
  BlobDeleteResponse,
  BlobItem,
  BlobLeaseClient,
  BlockBlobClient,
  BlockBlobUploadResponse,
  ContainerClient,
  ContainerCreateIfNotExistsResponse,
  ContainerCreateResponse,
  ContainerDeleteIfExistsResponse,
  ContainerDeleteResponse,
  ContainerFindBlobsByTagsSegmentResponse,
  ContainerGetAccessPolicyResponse,
  ContainerGetAccountInfoResponse,
  ContainerGetPropertiesResponse,
  ContainerListBlobFlatSegmentResponse,
  ContainerListBlobHierarchySegmentResponse,
  ContainerListBlobsOptions,
  ContainerSetAccessPolicyResponse,
  ContainerSetMetadataResponse,
  FilterBlobItem,
  HttpRequestBody,
  PageBlobClient,
} from "@azure/storage-blob";
import type { MapValue } from "@esposter/shared";
import type { Except } from "type-fest";

import { MockBlobBatchClient } from "@/models/MockBlobBatchClient";
import { MockBlockBlobClient } from "@/models/MockBlockBlobClient";
import { MockRestError } from "@/models/MockRestError";
import { MockContainerDatabase } from "@/store/MockContainerDatabase";
import { getBlobItemXml } from "@/util/getBlobItemXml";
import { getBlobPrefixXml } from "@/util/getBlobPrefixXml";
import { getListBlobsXml } from "@/util/getListBlobsXml";
import { toWebResourceLike } from "@/util/toWebResourceLike";
import { toHttpHeadersLike } from "@azure/core-http-compat";
import { createHttpHeaders, createPipelineRequest } from "@azure/core-rest-pipeline";
import { AnonymousCredential } from "@azure/storage-blob";
/**
 * An in-memory mock of the Azure ContainerClient.
 * It uses a Map to simulate blob storage.
 *
 * @example
 * const mockContainerClient = new MockContainerClient("", "hello world");
 * const blockBlobClient = mockContainerClient.getBlockBlobClient("hello world.txt");
 * await blockBlobClient.upload("hello world", 11);
 * const content = await blockBlobClient.downloadToBuffer();
 */
export class MockContainerClient implements Except<ContainerClient, "accountName"> {
  connectionString: string;
  containerName: string;
  credential: AnonymousCredential = new AnonymousCredential();
  url: string;

  get container(): MapValue<typeof MockContainerDatabase> {
    let container = MockContainerDatabase.get(this.containerName);
    if (!container) {
      container = new Map();
      MockContainerDatabase.set(this.containerName, container);
    }
    return container;
  }

  constructor(connectionString: string, containerName: string) {
    this.connectionString = connectionString;
    this.containerName = containerName;
    this.url = `https://mockaccount.blob.core.windows.net/${this.containerName}`;
  }

  create(): Promise<ContainerCreateResponse> {
    throw new Error("Method not implemented.");
  }

  createIfNotExists(): Promise<ContainerCreateIfNotExistsResponse> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<ContainerDeleteResponse> {
    throw new Error("Method not implemented.");
  }

  deleteBlob(blobName: string): Promise<BlobDeleteResponse> {
    if (!this.container.has(blobName)) throw new MockRestError("The specified blob does not exist.", 404);
    this.container.delete(blobName);
    return Promise.resolve({
      _response: {
        headers: toHttpHeadersLike(createHttpHeaders()),
        parsedHeaders: {},
        request: toWebResourceLike(createPipelineRequest({ url: `${this.url}/${blobName}` })),
        status: 200,
      },
    });
  }

  deleteIfExists(): Promise<ContainerDeleteIfExistsResponse> {
    throw new Error("Method not implemented.");
  }

  exists(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  findBlobsByTags(): PagedAsyncIterableIterator<FilterBlobItem, ContainerFindBlobsByTagsSegmentResponse> {
    throw new Error("Method not implemented.");
  }

  generateSasStringToSign(): string {
    throw new Error("Method not implemented.");
  }

  generateSasUrl(): Promise<string> {
    return Promise.resolve(
      `https://mockaccount.blob.core.windows.net/${this.containerName}?sv=2025-11-05&sr=c&sig=mock-signature&st=1970-01-01T00:00:00Z&se=2099-12-31T23:59:59Z&sp=rw`,
    );
  }

  generateUserDelegationSasStringToSign(): string {
    throw new Error("Method not implemented.");
  }

  generateUserDelegationSasUrl(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  getAccessPolicy(): Promise<ContainerGetAccessPolicyResponse> {
    throw new Error("Method not implemented.");
  }

  getAccountInfo(): Promise<ContainerGetAccountInfoResponse> {
    throw new Error("Method not implemented.");
  }

  getAppendBlobClient(): AppendBlobClient {
    throw new Error("Method not implemented.");
  }

  getBlobBatchClient(): BlobBatchClient {
    return new MockBlobBatchClient(this.url) as unknown as BlobBatchClient;
  }

  getBlobClient(blobName: string): BlobClient {
    return new MockBlockBlobClient(this.connectionString, this.containerName, blobName) as unknown as BlobClient;
  }

  getBlobLeaseClient(): BlobLeaseClient {
    throw new Error("Method not implemented.");
  }

  getBlockBlobClient(blobName: string): BlockBlobClient {
    return new MockBlockBlobClient(this.connectionString, this.containerName, blobName) as unknown as BlockBlobClient;
  }

  getPageBlobClient(): PageBlobClient {
    throw new Error("Method not implemented.");
  }

  getProperties(): Promise<ContainerGetPropertiesResponse> {
    throw new Error("Method not implemented.");
  }

  listBlobsByHierarchy(
    delimiter: string,
    options?: ContainerListBlobsOptions,
  ): PagedAsyncIterableIterator<BlobHierarchyItem, ContainerListBlobHierarchySegmentResponse> {
    const blobHierarchyItemIterator = this.getBlobHierarchyItemIterator(delimiter, options);
    return {
      byPage: () =>
        async function* (this: MockContainerClient): AsyncGenerator<ContainerListBlobFlatSegmentResponse> {
          // For a simple mock, we'll return all entities in a single page
          // A more complex mock could implement maxPageSize and continuationTokens
          const allBlobItems: BlobItem[] = [];
          const allBlobItemXml: string[] = [];
          const allBlobPrefixes: { name: string }[] = [];
          const allBlobPrefixXml: string[] = [];
          for await (const blobHierarchyItem of blobHierarchyItemIterator)
            if (blobHierarchyItem.kind === "blob") {
              allBlobItems.push(blobHierarchyItem);
              allBlobItemXml.push(getBlobItemXml(blobHierarchyItem));
            } else {
              allBlobPrefixes.push({ name: blobHierarchyItem.name });
              allBlobPrefixXml.push(getBlobPrefixXml(blobHierarchyItem.name));
            }

          if (allBlobItems.length > 0 || allBlobPrefixes.length > 0)
            yield await Promise.resolve({
              _response: {
                bodyAsText: getListBlobsXml(
                  this.containerName,
                  `${allBlobItemXml.join("")}${allBlobPrefixXml.join("")}`,
                ),
                headers: toHttpHeadersLike(createHttpHeaders()),
                parsedBody: {
                  containerName: this.containerName,
                  marker: "",
                  prefix: options?.prefix ?? "",
                  segment: {
                    blobItems: allBlobItems,
                  },
                  serviceEndpoint: "",
                },
                parsedHeaders: {},
                request: toWebResourceLike(createPipelineRequest({ url: "" })),
                status: 200,
              },
              containerName: this.containerName,
              marker: "",
              prefix: options?.prefix ?? "",
              segment: {
                blobItems: allBlobItems,
              },
              serviceEndpoint: "",
            });
        }.bind(this)(),
      next: blobHierarchyItemIterator.next.bind(blobHierarchyItemIterator),
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  listBlobsFlat(): PagedAsyncIterableIterator<BlobItem, ContainerListBlobFlatSegmentResponse> {
    const blobItemIterator = this.getBlobItemIterator();
    return {
      byPage: () =>
        async function* (this: MockContainerClient): AsyncGenerator<ContainerListBlobFlatSegmentResponse> {
          // For a simple mock, we'll return all entities in a single page
          // A more complex mock could implement maxPageSize and continuationTokens
          const allBlobItems: BlobItem[] = [];
          const allBlobItemXml: string[] = [];
          for await (const blobItem of blobItemIterator) {
            allBlobItems.push(blobItem);
            allBlobItemXml.push(getBlobItemXml(blobItem));
          }

          if (allBlobItems.length > 0)
            yield await Promise.resolve({
              _response: {
                bodyAsText: getListBlobsXml(this.containerName, allBlobItemXml.join("")),
                headers: toHttpHeadersLike(createHttpHeaders()),
                parsedBody: {
                  containerName: this.containerName,
                  marker: "",
                  prefix: "",
                  segment: {
                    blobItems: allBlobItems,
                  },
                  serviceEndpoint: "",
                },
                parsedHeaders: {},
                request: toWebResourceLike(createPipelineRequest({ url: "" })),
                status: 200,
              },
              containerName: this.containerName,
              marker: "",
              prefix: "",
              segment: {
                blobItems: allBlobItems,
              },
              serviceEndpoint: "",
            });
        }.bind(this)(),
      next: blobItemIterator.next.bind(blobItemIterator),
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  setAccessPolicy(): Promise<ContainerSetAccessPolicyResponse> {
    throw new Error("Method not implemented.");
  }

  setMetadata(): Promise<ContainerSetMetadataResponse> {
    throw new Error("Method not implemented.");
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

  private async *getBlobHierarchyItemIterator(
    delimiter: string,
    options?: ContainerListBlobsOptions,
  ): AsyncGenerator<BlobHierarchyItem> {
    const prefix = options?.prefix ?? "";
    const uniqueSubprefixes = new Set<string>();
    const blobsInCurrentLevel: BlobItem[] = [];

    for (const [name, buffer] of this.container.entries()) {
      if (!name.startsWith(prefix))
        // Filter by prefix
        continue;

      const nameAfterPrefix = name.slice(prefix.length);
      const delimiterIndex = nameAfterPrefix.indexOf(delimiter);

      if (delimiterIndex === -1)
        // No delimiter found after the prefix, so it's a blob at this level
        blobsInCurrentLevel.push({
          deleted: false,
          name,
          properties: {
            blobType: "BlockBlob",
            contentLength: buffer.length,
            contentType: "application/octet-stream",
            etag: `"${crypto.randomUUID()}"`,
            lastModified: new Date(),
            leaseState: "available",
            leaseStatus: "unlocked",
          },
          snapshot: "",
        });
      else {
        // Delimiter found, this represents a "subdirectory"
        const subprefix = `${prefix}${nameAfterPrefix.slice(0, delimiterIndex + delimiter.length)}`;
        uniqueSubprefixes.add(subprefix);
      }
    }
    // Yield prefixes first, then blobs, which mimics Azure's behavior
    for (const prefixName of [...uniqueSubprefixes].toSorted())
      yield await Promise.resolve({ kind: "prefix", name: prefixName });
    for (const blobItem of blobsInCurrentLevel) yield await Promise.resolve({ kind: "blob", ...blobItem });
  }

  private async *getBlobItemIterator(): AsyncGenerator<BlobItem> {
    for (const [name, buffer] of this.container.entries())
      yield await Promise.resolve({
        deleted: false,
        name,
        properties: {
          blobType: "BlockBlob",
          contentLength: buffer.length,
          contentType: "application/octet-stream",
          etag: `"${crypto.randomUUID()}"`,
          lastModified: new Date(),
          leaseState: "available",
          leaseStatus: "unlocked",
        },
        snapshot: "",
      });
  }
}
