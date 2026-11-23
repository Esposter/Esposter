import { compressZstd } from "@esposter/db";
import { DEFAULT_COMPRESSION_LEVEL } from "@esposter/shared";

// A records product's stored bytes: each record's JSON compressed as zstd, which is the one encoding records are stored with
export const encodeHostedAssetRecord = async (
  bytes: Buffer,
): Promise<{ body: Uint8Array; contentEncoding: string }> => ({
  body: await compressZstd(bytes, DEFAULT_COMPRESSION_LEVEL),
  contentEncoding: "zstd",
});
