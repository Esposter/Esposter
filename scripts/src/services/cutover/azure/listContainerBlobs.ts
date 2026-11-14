import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { ContainerClient } from "@azure/storage-blob";

import { AZURE_PAGE_SIZE } from "#src/services/cutover/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every blob of a container, page by page, with the properties a copy carries across.
// Azure gives every blob a size, so a blob listed without one fails the listing rather than being copied at a guessed size
export const listContainerBlobs = async function* (containerClient: ContainerClient): AsyncGenerator<BlobEntry> {
  for await (const page of containerClient.listBlobsFlat().byPage({ maxPageSize: AZURE_PAGE_SIZE }))
    for (const { name, properties } of page.segment.blobItems) {
      if (properties.contentLength === undefined)
        throw new InvalidOperationError(Operation.Read, name, "is listed without a size");
      yield {
        cacheControl: properties.cacheControl,
        contentDisposition: properties.contentDisposition,
        contentEncoding: properties.contentEncoding,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        md5: properties.contentMD5 === undefined ? undefined : Buffer.from(properties.contentMD5).toString("base64"),
        name,
        size: properties.contentLength,
      };
    }
};
