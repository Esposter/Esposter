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
  BlobGenerateSasUrlOptions,
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
import type { MapValue } from "@esposter/shared";
import type { Except } from "type-fest";

import { BLOB_NOT_FOUND_MESSAGE } from "#src/constants";
import { MockRestError } from "#src/models/MockRestError";
import { getBlobUrl } from "#src/services/container/getBlobUrl";
import { getBlobUrlParts } from "#src/services/container/getBlobUrlParts";
import { getMockContainer } from "#src/services/container/getMockContainer";
import { createMockResponse } from "#src/services/createMockResponse";
import { getMockSasUrl } from "#src/services/getMockSasUrl";
import {
  getMockContainerBlobDatesKey,
  MockContainerBlobDatesDatabase,
  storeMockBlobWrite,
} from "#src/store/MockContainerBlobDatesDatabase";
import { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import { AnonymousCredential } from "@azure/storage-blob";
import { noop } from "@esposter/shared";
import { Readable } from "node:stream";

export class MockBlobClient implements Except<BlobClient, "accountName"> {
  connectionString: string;
  containerName: string;
  credential: AnonymousCredential = new AnonymousCredential();
  name: string;
  url: string;

  get container(): MapValue<typeof MockContainerDatabase> {
    return getMockContainer(this.containerName);
  }

  constructor(connectionString: string, containerName: string, blobName: string) {
    this.connectionString = connectionString;
    this.containerName = containerName;
    this.name = blobName;
    this.url = getBlobUrl(this.containerName, this.name);
  }

  abortCopyFromURL(): Promise<BlobAbortCopyFromURLResponse> {
    throw new Error("Method not implemented.");
  }

  beginCopyFromURL(
    copySource: string,
  ): Promise<
    PollerLikeWithCancellation<PollOperationState<BlobBeginCopyFromURLResponse>, BlobBeginCopyFromURLResponse>
  > {
    const sourceParts = getBlobUrlParts(copySource);
    if (!sourceParts) throw new MockRestError("Invalid copy source URL format", 400);

    const { blobName: sourceBlobName, containerName: sourceContainerName } = sourceParts;
    const sourceContainer = MockContainerDatabase.get(sourceContainerName);
    if (!sourceContainer) throw new MockRestError("Source container not found", 404);

    const sourceData = sourceContainer.get(sourceBlobName);
    if (!sourceData) throw new MockRestError("Source blob not found", 404);

    storeMockBlobWrite(this.containerName, this.name, this.container.has(this.name));
    this.container.set(this.name, Buffer.from(sourceData));
    const response: BlobBeginCopyFromURLResponse = { _response: createMockResponse(202, `${this.url}?comp=copy`) };
    return Promise.resolve({
      cancelOperation: () => Promise.resolve(),
      getOperationState: () => ({ isCompleted: true, result: response }),
      getResult: () => response,
      isDone: () => true,
      isStopped: () => false,
      onProgress: () => noop,
      poll: () => Promise.resolve(),
      pollUntilDone: () => Promise.resolve(response),
      stopPolling: noop,
    });
  }

  createSnapshot(): Promise<BlobCreateSnapshotResponse> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<BlobDeleteResponse> {
    if (!this.container.has(this.name)) throw new MockRestError(BLOB_NOT_FOUND_MESSAGE, 404);
    this.container.delete(this.name);
    MockContainerBlobDatesDatabase.delete(getMockContainerBlobDatesKey(this.containerName, this.name));
    return Promise.resolve({ _response: createMockResponse(200) });
  }

  deleteIfExists(): Promise<BlobDeleteIfExistsResponse> {
    const succeeded = this.container.has(this.name);
    if (succeeded) {
      this.container.delete(this.name);
      MockContainerBlobDatesDatabase.delete(getMockContainerBlobDatesKey(this.containerName, this.name));
    }
    return Promise.resolve({ _response: createMockResponse(succeeded ? 200 : 404), succeeded });
  }

  deleteImmutabilityPolicy(): Promise<BlobDeleteImmutabilityPolicyResponse> {
    throw new Error("Method not implemented.");
  }

  download(): Promise<BlobDownloadResponseParsed> {
    const buffer = this.container.get(this.name);
    return Promise.resolve({
      _response: createMockResponse(buffer ? 200 : 404),
      readableStreamBody: buffer ? Readable.from(buffer) : undefined,
    });
  }

  downloadToBuffer(): Promise<Buffer> {
    const data = this.container.get(this.name);
    if (!data) throw new MockRestError(BLOB_NOT_FOUND_MESSAGE, 404);
    return Promise.resolve(Buffer.from(data));
  }

  downloadToFile(): Promise<BlobDownloadResponseParsed> {
    throw new Error("Method not implemented.");
  }

  exists(): Promise<boolean> {
    return Promise.resolve(this.container.has(this.name));
  }

  generateSasStringToSign(): string {
    throw new Error("Method not implemented.");
  }

  generateSasUrl(options: BlobGenerateSasUrlOptions): Promise<string> {
    return Promise.resolve(getMockSasUrl(this.url, options.permissions, "b"));
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

  // Only what a caller can act on: the stored buffer's length, which is how a server checks an upload's real
  // Size rather than the one the client declared
  getProperties(): Promise<BlobGetPropertiesResponse> {
    const blob = this.container.get(this.name);
    if (!blob) throw new MockRestError(BLOB_NOT_FOUND_MESSAGE, 404);
    return Promise.resolve({
      _response: createMockResponse(200),
      contentLength: blob.byteLength,
      ...MockContainerBlobDatesDatabase.get(getMockContainerBlobDatesKey(this.containerName, this.name)),
    } as BlobGetPropertiesResponse);
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
