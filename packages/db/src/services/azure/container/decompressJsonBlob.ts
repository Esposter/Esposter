import { promisify } from "node:util";
import { zstdDecompress } from "node:zlib";

// The bytes a JSON blob was serialized to, decompressed from the zstd frame writeJsonBlob stored. Every server reader
// Decompresses through here, so a body read off a download (readBlobState) and one read whole (readJsonBlob) decode alike
export const decompressJsonBlob = promisify(zstdDecompress);
