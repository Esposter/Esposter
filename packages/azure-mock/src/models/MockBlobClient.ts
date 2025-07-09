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

import { MockBlockBlobClient } from "@/models/MockBlockBlobClient";
import { MockRestError } from "@/models/MockRestError";
import { MockBlobDatabase } from "@/store/MockBlobDatabase";
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

  constructor(connectionString: string, containerName: string, blobName: string) {
    this.connectionString = connectionString;
    this.containerName = containerName;
    this.name = blobName;
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

  createSnapshot(): Promise<BlobCreateSnapshotResponse> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<BlobDeleteResponse> {
    if (!MockBlobDatabase[this.containerName].has(this.name))
      throw new MockRestError("The specified blob does not exist.", 404);
    MockBlobDatabase[this.containerName].delete(this.name);
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
    const buffer = MockBlobDatabase[this.containerName].get(this.name);
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
    const data = MockBlobDatabase[this.containerName].get(this.name);
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
    return new MockBlockBlobClient(this.connectionString, this.containerName, this.name) as unknown as BlockBlobClient;
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
