import type {
  AppendBlobClient,
  BlobAbortCopyFromURLResponse,
  BlobBeginCopyFromURLResponse,
  BlobClient,
  BlobCopyFromURLResponse,
  BlobCreateSnapshotResponse,
  BlobDeleteIfExistsResponse,
  BlobDeleteImmutabilityPolicyResponse,
  BlobDeleteResponse,
  BlobDownloadResponseParsed,
  BlobGetAccountInfoResponse,
  BlobGetPropertiesResponse,
  BlobGetTagsResponse,
  BlobLeaseClient,
  BlobSetHTTPHeadersResponse,
  BlobSetImmutabilityPolicyResponse,
  BlobSetLegalHoldResponse,
  BlobSetMetadataResponse,
  BlobSetTagsResponse,
  BlobSetTierResponse,
  BlobUndeleteResponse,
  BlockBlobClient,
  PageBlobClient,
  PollerLikeWithCancellation,
  PollOperationState,
} from "@azure/storage-blob";
import type { Except } from "type-fest";
import type { MapValue } from "type-fest/source/entry";

import { MockRestError } from "@/models/MockRestError";
import { MockContainerDatabase } from "@/store/MockContainerDatabase";
import { toWebResourceLike } from "@/util/toWebResourceLike";
import { toHttpHeadersLike } from "@azure/core-http-compat";
import { createHttpHeaders, createPipelineRequest } from "@azure/core-rest-pipeline";
import { AnonymousCredential } from "@azure/storage-blob";
import { Readable } from "node:stream";

export class MockBlobClient implements Except<BlobClient, "accountName"> {
  connectionString: string;
  containerName: string;
  credential: AnonymousCredential = new AnonymousCredential();
  name: string;
  url: string;

  get container(): MapValue<typeof MockContainerDatabase> {
    let container = MockContainerDatabase.get(this.containerName);
    if (!container) {
      container = new Map();
      MockContainerDatabase.set(this.containerName, container);
    }
    return container;
  }

  constructor(connectionString: string, containerName: string, blobName: string) {
    this.connectionString = connectionString;
    this.containerName = containerName;
    this.name = blobName;
    this.url = `https://mockaccount.blob.core.windows.net/${this.containerName}/${this.name}`;
  }

  abortCopyFromURL(): Promise<BlobAbortCopyFromURLResponse> {
    throw new Error("Method not implemented.");
  }

  beginCopyFromURL(
    copySource: string,
  ): Promise<
    PollerLikeWithCancellation<PollOperationState<BlobBeginCopyFromURLResponse>, BlobBeginCopyFromURLResponse>
  > {
    // Extract container and blob name from the copy source URL
    // Expected format: https://account.blob.core.windows.net/container/blob-name
    const url = new URL(copySource);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    if (pathSegments.length < 2) throw new MockRestError("Invalid copy source URL format", 400);

    const sourceContainerName = pathSegments[0];
    const sourceBlobName = pathSegments.slice(1).join("/");
    const sourceContainer = MockContainerDatabase.get(sourceContainerName);
    if (!sourceContainer) throw new MockRestError("Source container not found", 404);

    const sourceData = sourceContainer.get(sourceBlobName);
    if (!sourceData) throw new MockRestError("Source blob not found", 404);

    this.container.set(this.name, Buffer.from(sourceData));
    const response: BlobBeginCopyFromURLResponse = {
      _response: {
        headers: toHttpHeadersLike(createHttpHeaders()),
        parsedHeaders: {},
        request: toWebResourceLike(createPipelineRequest({ url: `${this.url}?comp=copy` })),
        status: 202,
      },
    };
    return Promise.resolve({
      cancelOperation: () => Promise.resolve(),
      getOperationState: () => ({ isCompleted: true, result: response }),
      getResult: () => response,
      isDone: () => true,
      isStopped: () => false,
      onProgress: () => () => {},
      poll: () => Promise.resolve(),
      pollUntilDone: () => Promise.resolve(response),
      stopPolling: () => {},
    });
  }

  createSnapshot(): Promise<BlobCreateSnapshotResponse> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<BlobDeleteResponse> {
    if (!this.container.has(this.name)) throw new MockRestError("The specified blob does not exist.", 404);
    this.container.delete(this.name);
    return Promise.resolve({
      _response: {
        headers: toHttpHeadersLike(createHttpHeaders()),
        parsedHeaders: {},
        request: toWebResourceLike(createPipelineRequest({ url: "" })),
        status: 200,
      },
    });
  }

  deleteIfExists(): Promise<BlobDeleteIfExistsResponse> {
    throw new Error("Method not implemented.");
  }

  deleteImmutabilityPolicy(): Promise<BlobDeleteImmutabilityPolicyResponse> {
    throw new Error("Method not implemented.");
  }

  download(): Promise<BlobDownloadResponseParsed> {
    const buffer = this.container.get(this.name);
    return Promise.resolve({
      _response: {
        headers: toHttpHeadersLike(createHttpHeaders()),
        parsedHeaders: {},
        request: toWebResourceLike(createPipelineRequest({ url: "" })),
        status: buffer ? 200 : 404,
      },
      readableStreamBody: buffer ? Readable.from(buffer) : undefined,
    });
  }

  downloadToBuffer(): Promise<Buffer> {
    const data = this.container.get(this.name);
    if (!data) throw new MockRestError("The specified blob does not exist.", 404);
    return Promise.resolve(Buffer.from(data));
  }

  downloadToFile(): Promise<BlobDownloadResponseParsed> {
    throw new Error("Method not implemented.");
  }

  exists(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  generateSasStringToSign(): string {
    throw new Error("Method not implemented.");
  }

  generateSasUrl(): Promise<string> {
    return Promise.resolve(
      `https://mockaccount.blob.core.windows.net/${this.containerName}/${this.name}?sv=2025-11-05&sr=b&sig=mock-signature&st=1970-01-01T00:00:00Z&se=2099-12-31T23:59:59Z&sp=r`,
    );
  }

  generateUserDelegationSasStringToSign(): string {
    throw new Error("Method not implemented.");
  }

  generateUserDelegationSasUrl(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  getAccountInfo(): Promise<BlobGetAccountInfoResponse> {
    throw new Error("Method not implemented.");
  }

  getAppendBlobClient(): AppendBlobClient {
    throw new Error("Method not implemented.");
  }

  getBlobLeaseClient(): BlobLeaseClient {
    throw new Error("Method not implemented.");
  }

  getBlockBlobClient(): BlockBlobClient {
    throw new Error("Method not implemented.");
  }

  getPageBlobClient(): PageBlobClient {
    throw new Error("Method not implemented.");
  }

  getProperties(): Promise<BlobGetPropertiesResponse> {
    throw new Error("Method not implemented.");
  }

  getTags(): Promise<BlobGetTagsResponse> {
    throw new Error("Method not implemented.");
  }

  setAccessTier(): Promise<BlobSetTierResponse> {
    throw new Error("Method not implemented.");
  }

  setHTTPHeaders(): Promise<BlobSetHTTPHeadersResponse> {
    throw new Error("Method not implemented.");
  }

  setImmutabilityPolicy(): Promise<BlobSetImmutabilityPolicyResponse> {
    throw new Error("Method not implemented.");
  }

  setLegalHold(): Promise<BlobSetLegalHoldResponse> {
    throw new Error("Method not implemented.");
  }

  setMetadata(): Promise<BlobSetMetadataResponse> {
    throw new Error("Method not implemented.");
  }

  setTags(): Promise<BlobSetTagsResponse> {
    throw new Error("Method not implemented.");
  }

  syncCopyFromURL(): Promise<BlobCopyFromURLResponse> {
    throw new Error("Method not implemented.");
  }

  undelete(): Promise<BlobUndeleteResponse> {
    throw new Error("Method not implemented.");
  }

  withSnapshot(): BlockBlobClient {
    throw new Error("Method not implemented.");
  }

  withVersion(): BlobClient {
    throw new Error("Method not implemented.");
  }
}
