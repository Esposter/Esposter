import type { BlobRequestConditions, ContainerClient } from "@azure/storage-blob";
import type { Resource } from "@esposter/db-schema";

import { getContentBlobName } from "#src/services/azure/container/getContentBlobName";
import { CONTENT_COMPRESSION_LEVEL, MAX_CONTENT_ENCODING_WINDOW_LOG } from "#src/services/resource/constants";
import { promisify } from "node:util";
import { constants, zstdCompress } from "node:zlib";

const compress = promisify(zstdCompress);
// The working copy at rest: a standalone zstd frame the blob serves as `Content-Encoding: zstd`, so a browser
// Reading it through a SAS receives the JSON it hashes while every server reader decompresses it itself
// (readResourceContentBlob). Compressed on the libuv threadpool, so no request waits behind it. Returns the stored
// Length, which is what the owner is charged
export const writeResourceContentBlob = async (
  containerClient: ContainerClient,
  resourceId: Resource["id"],
  serializedContent: string,
  conditions?: BlobRequestConditions,
): Promise<number> => {
  const compressedContent = await compress(serializedContent, {
    params: {
      [constants.ZSTD_c_compressionLevel]: CONTENT_COMPRESSION_LEVEL,
      [constants.ZSTD_c_windowLog]: MAX_CONTENT_ENCODING_WINDOW_LOG,
    },
  });
  await containerClient
    .getBlockBlobClient(getContentBlobName(resourceId))
    .upload(compressedContent, compressedContent.byteLength, {
      blobHTTPHeaders: { blobContentEncoding: "zstd", blobContentType: "application/json" },
      conditions,
    });
  return compressedContent.byteLength;
};
