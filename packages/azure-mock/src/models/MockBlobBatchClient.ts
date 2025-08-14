import type {
  AnonymousCredential,
  BatchSubResponse,
  BlobBatchClient,
  BlobBatchDeleteBlobsResponse,
  BlobDeleteOptions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import type { MapValue } from "type-fest/source/entry";

import { MockContainerDatabase } from "@/store/MockContainerDatabase";
import { getAzureErrorXml } from "@/util/getAzureErrorXml";
import { toWebResourceLike } from "@/util/toWebResourceLike";
import { toHttpHeadersLike } from "@azure/core-http-compat";
import { createHttpHeaders, createPipelineRequest } from "@azure/core-rest-pipeline";

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
      const urlParts = new URL(url);
      // pathname is like "/container/blob/name.txt"
      const pathSegments = urlParts.pathname.split("/").filter(Boolean);
      if (pathSegments.length < 2) {
        const errorCode = "InvalidUri";
        const statusMessage = "Invalid blob URL format.";
        subResponses.push({
          _request: { credential, url: this.url },
          bodyAsText: getAzureErrorXml(errorCode, statusMessage),
          errorCode,
          headers: toHttpHeadersLike(createHttpHeaders()),
          status: 400,
          statusMessage,
        });
        subResponsesFailedCount++;
      }

      const containerName = pathSegments[0];
      const blobName = pathSegments.slice(1).join("/");
      const container = this.getContainer(containerName);

      if (container.has(blobName)) {
        container.delete(blobName);
        subResponses.push({
          _request: { credential, url: this.url },
          headers: toHttpHeadersLike(createHttpHeaders()),
          status: 202,
          statusMessage: "Accepted",
        });
        subResponsesSucceededCount++;
      } else {
        const errorCode = "BlobNotFound";
        const statusMessage = "The specified blob does not exist.";
        subResponses.push({
          _request: { credential, url: this.url },
          bodyAsText: getAzureErrorXml(errorCode, statusMessage),
          errorCode,
          headers: toHttpHeadersLike(createHttpHeaders()),
          status: 404,
          statusMessage,
        });
        subResponsesFailedCount++;
      }
    }
    // The overall batch request itself is considered successful (202 Accepted).
    // The success of individual operations is detailed in the sub-responses.
    return Promise.resolve({
      _response: {
        headers: toHttpHeadersLike(
          createHttpHeaders({ "content-type": "multipart/mixed", "x-ms-request-id": crypto.randomUUID() }),
        ),
        parsedHeaders: {},
        request: toWebResourceLike(createPipelineRequest({ url: this.url })),
        status: 202,
      },
      subResponses,
      subResponsesFailedCount,
      subResponsesSucceededCount,
    });
  }

  getContainer(containerName: string): MapValue<typeof MockContainerDatabase> {
    let container = MockContainerDatabase.get(containerName);
    if (!container) {
      container = new Map();
      MockContainerDatabase.set(containerName, container);
    }
    return container;
  }
}
