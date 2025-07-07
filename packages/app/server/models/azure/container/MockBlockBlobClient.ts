import type { MockContainerClient } from "@@/server/models/azure/container/MockContainerClient";
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
  BlobDownloadResponseModel,
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
  BlobUploadCommonResponse,
  BlockBlobClient,
  BlockBlobCommitBlockListResponse,
  BlockBlobGetBlockListResponse,
  BlockBlobPutBlobFromUrlResponse,
  BlockBlobStageBlockFromURLResponse,
  BlockBlobStageBlockResponse,
  BlockBlobUploadResponse,
  HttpRequestBody,
  PageBlobClient,
  PollerLikeWithCancellation,
  PollOperationState,
} from "@azure/storage-blob";

import { MockRestError } from "@@/server/models/azure/MockRestError";
import { toWebResourceLike } from "@@/server/services/azure/container/toWebResourceLike";
import { toHttpHeadersLike } from "@azure/core-http-compat";
import { createHttpHeaders, createPipelineRequest } from "@azure/core-rest-pipeline";
import { AnonymousCredential } from "@azure/storage-blob";

export class MockBlockBlobClient implements Omit<BlockBlobClient, "storageClientContext"> {
  containerClient: MockContainerClient;
  credential = new AnonymousCredential();
  name: string;
  url: string;

  get accountName(): string {
    return this.containerClient.accountName;
  }

  get containerName(): string {
    return this.containerClient.containerName;
  }

  constructor(containerClient: MockContainerClient, name: string) {
    this.containerClient = containerClient;
    this.name = name;
    this.url = `https://mockaccount.blob.core.windows.net/${this.containerName}/${this.name}`;
  }

  abortCopyFromURL(): Promise<BlobAbortCopyFromURLResponse> {
    throw new Error("Method not implemented.");
  }

  beginCopyFromURL(): Promise<
    PollerLikeWithCancellation<PollOperationState<BlobBeginCopyFromURLResponse>, BlobBeginCopyFromURLResponse>
  > {
    throw new Error("Method not implemented.");
  }

  commitBlockList(): Promise<BlockBlobCommitBlockListResponse> {
    throw new Error("Method not implemented.");
  }

  createSnapshot(): Promise<BlobCreateSnapshotResponse> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<BlobDeleteResponse> {
    if (!this.containerClient.blobs.has(this.name)) throw new MockRestError("The specified blob does not exist.", 404);
    this.containerClient.blobs.delete(this.name);
    return new Promise((resolve) =>
      resolve({
        _response: {
          headers: toHttpHeadersLike(createHttpHeaders()),
          parsedHeaders: {},
          request: toWebResourceLike(createPipelineRequest({ url: "" })),
          status: 202,
        },
      }),
    );
  }

  deleteIfExists(): Promise<BlobDeleteIfExistsResponse> {
    throw new Error("Method not implemented.");
  }

  deleteImmutabilityPolicy(): Promise<BlobDeleteImmutabilityPolicyResponse> {
    throw new Error("Method not implemented.");
  }

  download(): Promise<BlobDownloadResponseParsed> {
    throw new Error("Method not implemented.");
  }

  downloadToBuffer(): Promise<Buffer> {
    const data = this.containerClient.blobs.get(this.name);
    if (!data) throw new MockRestError("The specified blob does not exist.", 404);
    return new Promise((resolve) => resolve(Buffer.from(data)));
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
    throw new Error("Method not implemented.");
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

  getBlockList(): Promise<BlockBlobGetBlockListResponse> {
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

  query(): Promise<BlobDownloadResponseModel> {
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

  stageBlock(): Promise<BlockBlobStageBlockResponse> {
    throw new Error("Method not implemented.");
  }

  stageBlockFromURL(): Promise<BlockBlobStageBlockFromURLResponse> {
    throw new Error("Method not implemented.");
  }

  syncCopyFromURL(): Promise<BlobCopyFromURLResponse> {
    throw new Error("Method not implemented.");
  }

  syncUploadFromURL(): Promise<BlockBlobPutBlobFromUrlResponse> {
    throw new Error("Method not implemented.");
  }

  undelete(): Promise<BlobUndeleteResponse> {
    throw new Error("Method not implemented.");
  }

  upload(body: HttpRequestBody, _contentLength: number): Promise<BlockBlobUploadResponse> {
    this.containerClient.blobs.set(this.name, Buffer.from(body));
    return new Promise((resolve) =>
      resolve({
        _response: {
          headers: toHttpHeadersLike(createHttpHeaders()),
          parsedHeaders: {},
          request: toWebResourceLike(createPipelineRequest({ url: "" })),
          status: 201,
        },
      }),
    );
  }

  uploadBrowserData(): Promise<BlobUploadCommonResponse> {
    throw new Error("Method not implemented.");
  }

  uploadData(): Promise<BlobUploadCommonResponse> {
    throw new Error("Method not implemented.");
  }

  uploadFile(): Promise<BlobUploadCommonResponse> {
    throw new Error("Method not implemented.");
  }

  uploadStream(): Promise<BlobUploadCommonResponse> {
    throw new Error("Method not implemented.");
  }

  withSnapshot(): BlockBlobClient {
    throw new Error("Method not implemented.");
  }

  withVersion(): BlobClient {
    throw new Error("Method not implemented.");
  }
}
