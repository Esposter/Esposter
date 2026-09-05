import type { BlobHierarchyItem } from "#src/models/container/BlobHierarchyItem";
import type { PagedAsyncIterableIterator } from "#src/models/PagedAsyncIterableIterator";
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
  ContainerGenerateSasUrlOptions,
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

import { BLOB_NOT_FOUND_MESSAGE, MOCK_BLOB_BASE_URL } from "#src/constants";
import { MockBlobBatchClient } from "#src/models/container/MockBlobBatchClient";
import { MockBlockBlobClient } from "#src/models/container/MockBlockBlobClient";
import { MockRestError } from "#src/models/MockRestError";
import { deleteMockBlob } from "#src/services/container/deleteMockBlob";
import { getBlobItemXml } from "#src/services/container/getBlobItemXml";
import { getBlobPrefixXml } from "#src/services/container/getBlobPrefixXml";
import { getBlobUrl } from "#src/services/container/getBlobUrl";
import { getListBlobsSegmentResponse } from "#src/services/container/getListBlobsSegmentResponse";
import { getMockContainer } from "#src/services/container/getMockContainer";
import { createMockResponse } from "#src/services/createMockResponse";
import { getMockSasUrl } from "#src/services/getMockSasUrl";
import { readMockBlobDates } from "#src/store/MockContainerBlobDatesDatabase";
import { readMockBlobMetadata } from "#src/store/MockContainerBlobMetadataDatabase";
import { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import { AnonymousCredential } from "@azure/storage-blob";
/**
 * An in-memory mock of the Azure ContainerClient — no emulator and no network.
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
    return getMockContainer(this.containerName);
  }

  constructor(connectionString: string, containerName: string) {
    this.connectionString = connectionString;
    this.containerName = containerName;
    this.url = `${MOCK_BLOB_BASE_URL}/${this.containerName}`;
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
    if (!deleteMockBlob(this.containerName, blobName)) throw new MockRestError(BLOB_NOT_FOUND_MESSAGE, 404);
    return Promise.resolve({ _response: createMockResponse(200, getBlobUrl(this.containerName, blobName)) });
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

  generateSasUrl(options: ContainerGenerateSasUrlOptions): Promise<string> {
    return Promise.resolve(getMockSasUrl(this.url, options.permissions, "c"));
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
    const blobHierarchyItemIterator = this.#getBlobHierarchyItemIterator(delimiter, options);
    return {
      byPage: () =>
        async function* (this: MockContainerClient): AsyncGenerator<ContainerListBlobHierarchySegmentResponse> {
          // Every blob comes back in one page: `maxPageSize` and continuation tokens are not implemented
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
            yield await Promise.resolve(
              getListBlobsSegmentResponse(
                this.containerName,
                options?.prefix ?? "",
                { blobItems: allBlobItems, blobPrefixes: allBlobPrefixes },
                `${allBlobItemXml.join("")}${allBlobPrefixXml.join("")}`,
              ),
            );
        }.bind(this)(),
      next: blobHierarchyItemIterator.next.bind(blobHierarchyItemIterator),
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  listBlobsFlat(
    options?: ContainerListBlobsOptions,
  ): PagedAsyncIterableIterator<BlobItem, ContainerListBlobFlatSegmentResponse> {
    const blobItemIterator = this.#getBlobItemIterator(options);
    return {
      byPage: () =>
        async function* (this: MockContainerClient): AsyncGenerator<ContainerListBlobFlatSegmentResponse> {
          // Every blob comes back in one page: `maxPageSize` and continuation tokens are not implemented
          const allBlobItems: BlobItem[] = [];
          const allBlobItemXml: string[] = [];
          for await (const blobItem of blobItemIterator) {
            allBlobItems.push(blobItem);
            allBlobItemXml.push(getBlobItemXml(blobItem));
          }

          if (allBlobItems.length > 0)
            yield await Promise.resolve(
              getListBlobsSegmentResponse(
                this.containerName,
                options?.prefix ?? "",
                { blobItems: allBlobItems },
                allBlobItemXml.join(""),
              ),
            );
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

  async *#getBlobHierarchyItemIterator(
    delimiter: string,
    options?: ContainerListBlobsOptions,
  ): AsyncGenerator<BlobHierarchyItem> {
    const prefix = options?.prefix ?? "";
    const uniqueSubprefixes = new Set<string>();
    const blobsInCurrentLevel: BlobItem[] = [];

    for (const [name, buffer] of this.container.entries()) {
      if (!name.startsWith(prefix)) continue;

      const nameAfterPrefix = name.slice(prefix.length);
      const delimiterIndex = nameAfterPrefix.indexOf(delimiter);

      if (delimiterIndex === -1) blobsInCurrentLevel.push(this.#getBlobItem(name, buffer, options?.includeMetadata));
      else {
        const subprefix = `${prefix}${nameAfterPrefix.slice(0, delimiterIndex + delimiter.length)}`;
        uniqueSubprefixes.add(subprefix);
      }
    }
    // Yield prefixes first, then blobs, which mimics Azure's behavior
    for (const prefixName of [...uniqueSubprefixes].toSorted())
      yield await Promise.resolve({ kind: "prefix", name: prefixName });
    for (const blobItem of blobsInCurrentLevel) yield await Promise.resolve({ kind: "blob", ...blobItem });
  }

  #getBlobItem(name: string, buffer: Buffer, isMetadataIncluded?: boolean): BlobItem {
    const { createdOn, etag, lastModified } = readMockBlobDates(this.containerName, name);
    return {
      deleted: false,
      // Only when asked for, like the service: a listing that did not request it reports none at all, so a
      // Caller that forgot the flag fails its own assertion rather than passing on the mock's generosity
      ...(isMetadataIncluded && { metadata: readMockBlobMetadata(this.containerName, name) }),
      name,
      properties: {
        blobType: "BlockBlob",
        contentLength: buffer.length,
        contentType: "application/octet-stream",
        createdOn,
        etag,
        lastModified,
        leaseState: "available",
        leaseStatus: "unlocked",
      },
      snapshot: "",
    };
  }

  async *#getBlobItemIterator(options?: ContainerListBlobsOptions): AsyncGenerator<BlobItem> {
    const prefix = options?.prefix ?? "";
    for (const [name, buffer] of this.container.entries()) {
      if (!name.startsWith(prefix)) continue;
      yield await Promise.resolve(this.#getBlobItem(name, buffer, options?.includeMetadata));
    }
  }
}
