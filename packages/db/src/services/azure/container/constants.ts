// A JSON blob is rewritten on every save, so its level buys speed rather than the last few percent of ratio — on a
// Sheet's rows the fastest level also compresses best, where the version store's level spends several times as
// Long for less (writeJsonBlob.bench.md)
export const JSON_BLOB_COMPRESSION_LEVEL = 1;
// RFC 9659: an encoder behind `Content-Encoding: zstd` must not need a larger window, since a browser's decoder is
// Only required to support this much — a stored format rather than a tunable
export const MAX_CONTENT_ENCODING_WINDOW_LOG = 23;
