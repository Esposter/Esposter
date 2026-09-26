import type { ContainerClient } from "@azure/storage-blob";

import { JSON_BLOB_COMPRESSION_LEVEL, MAX_CONTENT_ENCODING_WINDOW_LOG } from "#src/services/azure/container/constants";
import { promisify } from "node:util";
import { constants, zstdCompress } from "node:zlib";

const compress = promisify(zstdCompress);
// The one way a JSON document is stored: a standalone zstd frame the blob serves as `Content-Encoding: zstd`, so a
// Browser reading it through a SAS receives the JSON while every server reader decompresses it itself
// (readJsonBlob). Compressed on the libuv threadpool, so no request waits behind it. Returns the stored length,
// Which is what an owner is charged
export const writeJsonBlob = async (
  containerClient: ContainerClient,
  blobName: string,
  serializedJson: string,
): Promise<number> => {
  const compressedJson = await compress(serializedJson, {
    params: {
      [constants.ZSTD_c_compressionLevel]: JSON_BLOB_COMPRESSION_LEVEL,
      [constants.ZSTD_c_windowLog]: MAX_CONTENT_ENCODING_WINDOW_LOG,
    },
  });
  await containerClient
    .getBlockBlobClient(blobName)
    .upload(compressedJson, compressedJson.byteLength, {
      blobHTTPHeaders: { blobContentEncoding: "zstd", blobContentType: "application/json" },
    });
  return compressedJson.byteLength;
};
