import type { MapValue } from "#src/util/types/MapValue";
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
import type { Except } from "type-fest";

import { BLOB_NOT_FOUND_MESSAGE } from "#src/constants";
import { MockRestError } from "#src/models/shared/MockRestError";
import { NotImplementedError } from "#src/models/shared/NotImplementedError";
import { deleteMockBlob } from "#src/services/container/deleteMockBlob";
import { getBlobUrl } from "#src/services/container/getBlobUrl";
import { getBlobUrlParts } from "#src/services/container/getBlobUrlParts";
import { getMockContainer } from "#src/services/container/getMockContainer";
import { readMockBlobDates } from "#src/services/container/readMockBlobDates";
import { storeMockBlobWrite } from "#src/services/container/storeMockBlobWrite";
import { createMockResponse } from "#src/services/shared/createMockResponse";
import { getMockSasUrl } from "#src/services/shared/getMockSasUrl";
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
    throw new NotImplementedError(this.abortCopyFromURL.name);
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
    throw new NotImplementedError(this.createSnapshot.name);
  }

  delete(): Promise<BlobDeleteResponse> {
    if (!deleteMockBlob(this.containerName, this.name)) throw new MockRestError(BLOB_NOT_FOUND_MESSAGE, 404);
    return Promise.resolve({ _response: createMockResponse(200) });
  }

  deleteIfExists(): Promise<BlobDeleteIfExistsResponse> {
    const succeeded = deleteMockBlob(this.containerName, this.name);
    return Promise.resolve({ _response: createMockResponse(succeeded ? 200 : 404), succeeded });
  }

  deleteImmutabilityPolicy(): Promise<BlobDeleteImmutabilityPolicyResponse> {
    throw new NotImplementedError(this.deleteImmutabilityPolicy.name);
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
    throw new NotImplementedError(this.downloadToFile.name);
  }

  exists(): Promise<boolean> {
    return Promise.resolve(this.container.has(this.name));
  }

  generateSasStringToSign(): string {
    throw new NotImplementedError(this.generateSasStringToSign.name);
  }

  generateSasUrl(options: BlobGenerateSasUrlOptions): Promise<string> {
    return Promise.resolve(getMockSasUrl(this.url, options.permissions, "b"));
  }

  generateUserDelegationSasStringToSign(): string {
    throw new NotImplementedError(this.generateUserDelegationSasStringToSign.name);
  }

  generateUserDelegationSasUrl(): Promise<string> {
    throw new NotImplementedError(this.generateUserDelegationSasUrl.name);
  }

  getAccountInfo(): Promise<BlobGetAccountInfoResponse> {
    throw new NotImplementedError(this.getAccountInfo.name);
  }

  getAppendBlobClient(): AppendBlobClient {
    throw new NotImplementedError(this.getAppendBlobClient.name);
  }

  getBlobLeaseClient(): BlobLeaseClient {
    throw new NotImplementedError(this.getBlobLeaseClient.name);
  }

  getBlockBlobClient(): BlockBlobClient {
    throw new NotImplementedError(this.getBlockBlobClient.name);
  }

  getPageBlobClient(): PageBlobClient {
    throw new NotImplementedError(this.getPageBlobClient.name);
  }
  // Only what a caller can act on: the stored buffer's length, which is how a server checks an upload's real
  // Size rather than the one the client declared
  getProperties(): Promise<BlobGetPropertiesResponse> {
    const blob = this.container.get(this.name);
    if (!blob) throw new MockRestError(BLOB_NOT_FOUND_MESSAGE, 404);
    return Promise.resolve({
      _response: createMockResponse(200),
      contentLength: blob.byteLength,
      ...readMockBlobDates(this.containerName, this.name),
    } as BlobGetPropertiesResponse);
  }

  getTags(): Promise<BlobGetTagsResponse> {
    throw new NotImplementedError(this.getTags.name);
  }

  setAccessTier(): Promise<BlobSetTierResponse> {
    throw new NotImplementedError(this.setAccessTier.name);
  }

  setHTTPHeaders(): Promise<BlobSetHTTPHeadersResponse> {
    throw new NotImplementedError(this.setHTTPHeaders.name);
  }

  setImmutabilityPolicy(): Promise<BlobSetImmutabilityPolicyResponse> {
    throw new NotImplementedError(this.setImmutabilityPolicy.name);
  }

  setLegalHold(): Promise<BlobSetLegalHoldResponse> {
    throw new NotImplementedError(this.setLegalHold.name);
  }

  setMetadata(): Promise<BlobSetMetadataResponse> {
    throw new NotImplementedError(this.setMetadata.name);
  }

  setTags(): Promise<BlobSetTagsResponse> {
    throw new NotImplementedError(this.setTags.name);
  }

  syncCopyFromURL(): Promise<BlobCopyFromURLResponse> {
    throw new NotImplementedError(this.syncCopyFromURL.name);
  }

  undelete(): Promise<BlobUndeleteResponse> {
    throw new NotImplementedError(this.undelete.name);
  }

  withSnapshot(): BlockBlobClient {
    throw new NotImplementedError(this.withSnapshot.name);
  }

  withVersion(): BlobClient {
    throw new NotImplementedError(this.withVersion.name);
  }
}
