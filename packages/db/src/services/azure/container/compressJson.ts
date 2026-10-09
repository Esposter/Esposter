import { JSON_BLOB_COMPRESSION_LEVEL, MAX_CONTENT_ENCODING_WINDOW_LOG } from "#src/services/azure/container/constants";
import { promisify } from "node:util";
import { constants, zstdCompress } from "node:zlib";

const compress = promisify(zstdCompress);
// The one frame a JSON document is stored as: a standalone zstd frame the blob serves as `Content-Encoding: zstd`, so
// A browser reading it through a SAS receives the JSON while every server reader decompresses it itself (readJsonBlob).
// Compressed on the libuv threadpool, so no request waits behind it. The level is the caller's: a document rewritten on
// Every save takes the fast default, and a document written once and read many times takes a denser one
export const compressJson = (serializedJson: string, compressionLevel = JSON_BLOB_COMPRESSION_LEVEL): Promise<Buffer> =>
  compress(serializedJson, {
    params: {
      [constants.ZSTD_c_compressionLevel]: compressionLevel,
      [constants.ZSTD_c_windowLog]: MAX_CONTENT_ENCODING_WINDOW_LOG,
    },
  });
