import { JSON_BLOB_COMPRESSION_LEVEL, MAX_CONTENT_ENCODING_WINDOW_LOG } from "#src/services/azure/container/constants";
import { promisify } from "node:util";
import { constants, zstdCompress } from "node:zlib";

const compress = promisify(zstdCompress);
// The one frame a blob served as `Content-Encoding: zstd` is stored as, a JSON document or any other file a browser
// Reads through that header: a standalone frame inside the window every browser's decoder admits, so a browser reading
// It receives the content while every server reader decompresses it itself (readJsonBlob). Compressed on the libuv
// Threadpool, so no request waits behind it. The level is the caller's: a document rewritten on every save takes the
// Fast default, and a file written once and read many times takes a denser one
export const compressZstd = (
  content: Buffer | string,
  compressionLevel = JSON_BLOB_COMPRESSION_LEVEL,
): Promise<Buffer> =>
  compress(content, {
    params: {
      [constants.ZSTD_c_compressionLevel]: compressionLevel,
      [constants.ZSTD_c_windowLog]: MAX_CONTENT_ENCODING_WINDOW_LOG,
    },
  });
