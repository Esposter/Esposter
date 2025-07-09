import type {
  BlobDownloadResponseModel,
  BlobUploadCommonResponse,
  BlockBlobClient,
  BlockBlobCommitBlockListResponse,
  BlockBlobGetBlockListResponse,
  BlockBlobPutBlobFromUrlResponse,
  BlockBlobStageBlockFromURLResponse,
  BlockBlobStageBlockResponse,
  BlockBlobUploadResponse,
  HttpRequestBody,
} from "@azure/storage-blob";
import type { Except } from "type-fest";

import { MockBlobClient } from "@/models/MockBlobClient";
import { bodyToBuffer } from "@/util/bodyToBuffer";
import { toWebResourceLike } from "@/util/toWebResourceLike";
import { toHttpHeadersLike } from "@azure/core-http-compat";
import { createHttpHeaders, createPipelineRequest } from "@azure/core-rest-pipeline";

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

  async upload(body: HttpRequestBody, _contentLength: number): Promise<BlockBlobUploadResponse> {
    this.container.set(this.name, await bodyToBuffer(body));
    return {
      _response: {
        headers: toHttpHeadersLike(createHttpHeaders()),
        parsedHeaders: {},
        request: toWebResourceLike(createPipelineRequest({ url: "" })),
        status: 201,
      },
    };
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
