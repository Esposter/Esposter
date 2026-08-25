import type {
  BlobDownloadResponseModel,
  BlobUploadCommonResponse,
  BlockBlobClient,
  BlockBlobCommitBlockListResponse,
  BlockBlobGetBlockListResponse,
  BlockBlobPutBlobFromUrlResponse,
  BlockBlobStageBlockFromURLResponse,
  BlockBlobStageBlockResponse,
  BlockBlobUploadOptions,
  BlockBlobUploadResponse,
  HttpRequestBody,
} from "@azure/storage-blob";
import type { Except } from "type-fest";

import { MockBlobClient } from "#src/models/container/MockBlobClient";
import { MockRestError } from "#src/models/MockRestError";
import { bodyToBuffer } from "#src/services/container/bodyToBuffer";
import { createMockResponse } from "#src/services/createMockResponse";
import {
  getMockContainerBlobDatesKey,
  MOCK_BLOB_SEEDED_PROPERTIES,
  MockContainerBlobDatesDatabase,
  storeMockBlobWrite,
} from "#src/store/MockContainerBlobDatesDatabase";

export class MockBlockBlobClient extends MockBlobClient implements Except<BlockBlobClient, "accountName"> {
  commitBlockList(): Promise<BlockBlobCommitBlockListResponse> {
    throw new Error("Method not implemented.");
  }

  getBlockList(): Promise<BlockBlobGetBlockListResponse> {
    throw new Error("Method not implemented.");
  }

  query(): Promise<BlobDownloadResponseModel> {
    throw new Error("Method not implemented.");
  }

  stageBlock(): Promise<BlockBlobStageBlockResponse> {
    throw new Error("Method not implemented.");
  }

  stageBlockFromURL(): Promise<BlockBlobStageBlockFromURLResponse> {
    throw new Error("Method not implemented.");
  }

  syncUploadFromURL(): Promise<BlockBlobPutBlobFromUrlResponse> {
    throw new Error("Method not implemented.");
  }

  async upload(
    body: HttpRequestBody,
    _contentLength: number,
    options?: BlockBlobUploadOptions,
  ): Promise<BlockBlobUploadResponse> {
    // `ifNoneMatch: "*"` is the create-only upload: the service rejects it with 409 when the blob is already
    // There. The body is buffered first so the check and the write share one tick, because a concurrent create
    // Is the only thing this condition exists to lose against — awaiting between them would model no condition
    const buffer = await bodyToBuffer(body);
    if (options?.conditions?.ifNoneMatch === "*" && this.container.has(this.name))
      throw new MockRestError("The specified blob already exists.", 409);
    // `ifMatch` is the claim: the write lands only if the blob still carries the etag the caller read. Whoever
    // Writes first re-mints it, so every other holder of the old value is refused — which is how concurrent
    // Workers agree on one owner without a lock
    if (
      options?.conditions?.ifMatch !== undefined &&
      options.conditions.ifMatch !==
        (MockContainerBlobDatesDatabase.get(getMockContainerBlobDatesKey(this.containerName, this.name))?.etag ??
          MOCK_BLOB_SEEDED_PROPERTIES.etag)
    )
      throw new MockRestError("The condition specified using HTTP conditional header(s) is not met.", 412);
    storeMockBlobWrite(this.containerName, this.name, this.container.has(this.name));
    this.container.set(this.name, buffer);
    return { _response: createMockResponse(201) };
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
}
