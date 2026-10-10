import type { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import type { MapValue } from "#src/util/types/MapValue";
import type {
  AnonymousCredential,
  BatchSubResponse,
  BlobBatchClient,
  BlobBatchDeleteBlobsResponse,
  BlobDeleteOptions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

import {
  BLOB_NOT_FOUND_ERROR_CODE,
  BLOB_NOT_FOUND_MESSAGE,
  CONDITION_NOT_MET_ERROR_CODE,
  CONDITION_NOT_MET_MESSAGE,
} from "#src/constants";
import { NotImplementedError } from "#src/models/shared/NotImplementedError";
import { deleteMockBlob } from "#src/services/container/deleteMockBlob";
import { getAzureErrorXml } from "#src/services/container/getAzureErrorXml";
import { getBlobUrlParts } from "#src/services/container/getBlobUrlParts";
import { getMockContainer } from "#src/services/container/getMockContainer";
import { readMockBlobDates } from "#src/services/container/readMockBlobDates";
import { createMockResponse } from "#src/services/shared/createMockResponse";
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
    options?: BlobDeleteOptions,
  ): Promise<BlobBatchDeleteBlobsResponse> {
    // Only `ifUnmodifiedSince` is reproduced, the one a conditional delete takes. Any other condition would be dropped
    // Silently, so the mock refuses it instead of answering as if the condition held
    const { ifUnmodifiedSince, ...unsupportedConditions } = options?.conditions ?? {};
    const unsupportedConditionName = Object.entries(unsupportedConditions).find(
      ([, value]) => value !== undefined,
    )?.[0];
    if (unsupportedConditionName !== undefined)
      return Promise.reject(new NotImplementedError(`deleteBlobs with ${unsupportedConditionName}`));
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

      if (this.#checkIsModifiedSince(containerName, blobName, ifUnmodifiedSince)) {
        subResponses.push(
          this.#createFailedSubResponse(credential, 412, CONDITION_NOT_MET_ERROR_CODE, CONDITION_NOT_MET_MESSAGE),
        );
        subResponsesFailedCount++;
        continue;
      }

      if (deleteMockBlob(containerName, blobName)) {
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

  // A blob written after the instant a conditional delete names is refused, as the service refuses it. A blob that is not
  // There is not refused: it answers 404 the way an unconditional delete does
  #checkIsModifiedSince(containerName: string, blobName: string, ifUnmodifiedSince?: Date): boolean {
    return (
      ifUnmodifiedSince !== undefined &&
      getMockContainer(containerName).has(blobName) &&
      readMockBlobDates(containerName, blobName).lastModified > ifUnmodifiedSince
    );
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
