import type {
  AnonymousCredential,
  BatchSubResponse,
  BlobBatchClient,
  BlobBatchDeleteBlobsResponse,
  BlobDeleteOptions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import type { MapValue } from "@esposter/shared";

import { BLOB_NOT_FOUND_ERROR_CODE, BLOB_NOT_FOUND_MESSAGE } from "#src/constants";
import { getAzureErrorXml } from "#src/services/container/getAzureErrorXml";
import { getBlobUrlParts } from "#src/services/container/getBlobUrlParts";
import { getMockContainer } from "#src/services/container/getMockContainer";
import { createMockResponse } from "#src/services/createMockResponse";
import {
  getMockContainerBlobDatesKey,
  MockContainerBlobDatesDatabase,
} from "#src/store/MockContainerBlobDatesDatabase";
import { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import { toHttpHeadersLike } from "@azure/core-http-compat";
import { createHttpHeaders } from "@azure/core-rest-pipeline";

export class MockBlobBatchClient implements BlobBatchClient {
  url: string;

  constructor(url: string) {
    this.url = url;
  }
  /**
   * Simulates the deletion of multiple blobs in a single batch request.
   * It iterates through the requested deletions, removes existing blobs from the
   * underlying MockContainerDatabase, and builds a response object that reports
   * which deletions succeeded and which failed (e.g. for blobs that didn't exist).
   */
  // @ts-expect-error We will only implement urls for deleteBlobs and ignore overloads for now
  deleteBlobs(
    urls: string[],
    credential: AnonymousCredential | StorageSharedKeyCredential,
    _options?: BlobDeleteOptions,
  ): Promise<BlobBatchDeleteBlobsResponse> {
    const subResponses: BatchSubResponse[] = [];
    let subResponsesSucceededCount = 0;
    let subResponsesFailedCount = 0;

    for (const url of urls) {
      const urlParts = getBlobUrlParts(url);
      if (!urlParts) {
        subResponses.push(this.#createFailedSubResponse(credential, 400, "InvalidUri", "Invalid blob URL format."));
        subResponsesFailedCount++;
        continue;
      }

      const { blobName, containerName } = urlParts;
      const container = this.getContainer(containerName);

      if (container.has(blobName)) {
        container.delete(blobName);
        MockContainerBlobDatesDatabase.delete(getMockContainerBlobDatesKey(containerName, blobName));
        subResponses.push({
          _request: { credential, url: this.url },
          headers: toHttpHeadersLike(createHttpHeaders()),
          status: 202,
          statusMessage: "Accepted",
        });
        subResponsesSucceededCount++;
      } else {
        subResponses.push(
          this.#createFailedSubResponse(credential, 404, BLOB_NOT_FOUND_ERROR_CODE, BLOB_NOT_FOUND_MESSAGE),
        );
        subResponsesFailedCount++;
      }
    }
    // The overall batch request itself is considered successful (202 Accepted).
    // The success of individual operations is detailed in the sub-responses.
    return Promise.resolve({
      _response: {
        ...createMockResponse(202, this.url),
        headers: toHttpHeadersLike(
          createHttpHeaders({ "content-type": "multipart/mixed", "x-ms-request-id": crypto.randomUUID() }),
        ),
      },
      subResponses,
      subResponsesFailedCount,
      subResponsesSucceededCount,
    });
  }

  getContainer(containerName: string): MapValue<typeof MockContainerDatabase> {
    return getMockContainer(containerName);
  }

  #createFailedSubResponse(
    credential: AnonymousCredential | StorageSharedKeyCredential,
    status: number,
    errorCode: string,
    statusMessage: string,
  ): BatchSubResponse {
    return {
      _request: { credential, url: this.url },
      bodyAsText: getAzureErrorXml(errorCode, statusMessage),
      errorCode,
      headers: toHttpHeadersLike(createHttpHeaders()),
      status,
      statusMessage,
    };
  }
}
